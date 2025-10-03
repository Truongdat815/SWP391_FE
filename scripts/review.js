// Review PR diff bằng Claude, xuất review.md + issues.json
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fetch } from "undici";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

// Lấy diff giữa base và head của PR
const BASE = process.env.PR_BASE_SHA || "origin/master";
const HEAD = process.env.PR_HEAD_SHA || "HEAD";
try {
  execSync("git fetch --all --prune", { stdio: "ignore" });
} catch {
  // ignore fetch errors in CI-less environments
}
const diff = execSync(`git diff --unified=0 ${BASE}...${HEAD}`, {
  encoding: "utf8",
});

const files = diff
  .split("\ndiff --git ")
  .filter(Boolean)
  .map((chunk, i) =>
    i === 0 && diff.startsWith("diff --git ") ? "diff --git " + chunk : chunk
  )
  .filter(
    (c) =>
      !/\.(png|jpg|jpeg|gif|svg|ico|pdf|mp4|zip|tgz|lock|yarn|pnpm-lock|package-lock)\b/i.test(
        c
      )
  );

const systemPrompt = `
Bạn là senior Node.js reviewer. Ưu tiên:
1) Bảo mật (authz/authn, JWT, secrets, injection, validation, CORS, headers, rate-limit)
2) REST & hợp đồng (status code, schema, idempotency, pagination)
3) Hiệu năng & DB (N+1, index, projection, cache)
4) Ổn định & Observability (logging, error handling, request-id, metrics)
5) Maintainability (clean code, layering)

Hãy xuất 2 phần:
(A) REVIEW_MARKDOWN: nhận xét dạng Markdown (ngắn gọn, actionable, có code patch nếu cần)
(B) ISSUES_JSON: JSON array các finding (MUST be valid JSON, no comments).
`;

const userHeader = `
Repo context:
- Ngôn ngữ: Node.js/TypeScript/Express (giả định)
- Nhiệm vụ: Review unified git diff. Nêu rõ file:line nếu có thể.

Định dạng bắt buộc:
## REVIEW_MARKDOWN
...(markdown tóm tắt, có bullet)...

## ISSUES_JSON
\`\`\`json
[
  {
    "severity": "Critical|High|Medium|Low",
    "title": "Ngắn gọn, súc tích",
    "file": "relative/path/to/file.js",
    "line": 123,
    "rule": "e.g. JWT.Secret, Input.Validation, REST.StatusCode",
    "description": "Mô tả chi tiết vì sao là vấn đề",
    "recommendation": "Cách sửa/định hướng cụ thể",
    "evidence": "trích đoạn hoặc mô tả ngữ cảnh",
    "cwe": "CWE-xxx (optional)"
  }
]
\`\`\`
`;

async function callClaude(content) {
  const body = {
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.2,
    // 👉 system phải ở top-level (không dùng role:"system" trong messages)
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userHeader + "\n\n### DIFF CHUNK\n```\n" + content + "\n```",
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  // Anthropic trả về mảng content blocks; lấy text của block đầu
  const text = (json.content && json.content[0] && json.content[0].text) || "";
  return text;
}

function extractSections(text) {
  const mdIndex = text.indexOf("## REVIEW_MARKDOWN");
  const jsonIndex = text.indexOf("## ISSUES_JSON");
  let md = "";
  let issues = [];
  if (mdIndex !== -1) {
    md = text.slice(mdIndex, jsonIndex !== -1 ? jsonIndex : undefined).trim();
  } else {
    md = text.trim();
  }
  if (jsonIndex !== -1) {
    const after = text.slice(jsonIndex);
    const m = after.match(/```json([\s\S]*?)```/i);
    if (m) {
      try {
        issues = JSON.parse(m[1].trim());
      } catch {
        // fallback: empty
      }
    }
  }
  return { md, issues };
}

const MAX_CHARS = 80_000;
let reviewAll = `# AI Code Review (Claude)\n\n> Base: \`${BASE}\` → Head: \`${HEAD}\`\n\n`;
let allIssues = [];

(async () => {
  if (!files.length) {
    reviewAll += "_No code changes detected in diff._\n";
  } else {
    for (const chunk of files) {
      const content = chunk.slice(0, MAX_CHARS);
      if (content.trim().length < 50) continue;

      try {
        const answer = await callClaude(content);
        const { md, issues } = extractSections(answer);
        reviewAll += `\n---\n\n${md}\n`;
        if (Array.isArray(issues)) {
          for (const it of issues) {
            if (!it || !it.title) continue;
            it.severity = (it.severity || "Medium").trim();
            it.file = it.file || "";
            it.line = Number.isInteger(it.line) ? it.line : null;
            allIssues.push(it);
          }
        }
      } catch (error) {
        reviewAll += `\n**Error reviewing a chunk:** ${String(error)}\n`;
      }
    }
  }

  writeFileSync("review.md", reviewAll, "utf8");
  writeFileSync("issues.json", JSON.stringify(allIssues, null, 2), "utf8");
  console.log(
    `Wrote review.md & issues.json with ${allIssues.length} findings.`
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
