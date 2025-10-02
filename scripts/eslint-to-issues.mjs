// scripts/eslint-to-issues.mjs
// Tạo hoặc cập nhật 1 Issue tổng hợp lỗi ESLint trên PR hiện tại.
// - Input: đường dẫn report JSON của ESLint (tham số CLI)
// - Env cần: GITHUB_TOKEN, REPO (owner/repo), PR_NUMBER (tùy chọn)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fetch } from "undici";

const INPUT = process.argv[2] || "eslint-report.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO; // "owner/repo"
const PR_NUMBER = process.env.PR_NUMBER; // optional

if (!GITHUB_TOKEN || !REPO) {
  console.error("[eslint-to-issues] Missing GITHUB_TOKEN or REPO env.");
  process.exit(0);
}

if (!fs.existsSync(INPUT)) {
  console.log(`[eslint-to-issues] No report found: ${INPUT}`);
  process.exit(0);
}

let data = [];
try {
  data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
} catch (e) {
  console.error("[eslint-to-issues] Invalid JSON. Skipping.");
  process.exit(0);
}

let totalErrors = 0;
let totalWarnings = 0;

let body = `## ESLint Report

> Generated automatically by CI. Please fix the following issues.  
> Repo: \`${REPO}\`${PR_NUMBER ? ` • PR #${PR_NUMBER}` : ""}

`;

const cwd = process.cwd() + path.sep;

for (const file of data) {
  const { filePath, messages = [], errorCount = 0, warningCount = 0 } = file;
  if (!messages.length) continue;

  totalErrors += errorCount;
  totalWarnings += warningCount;

  const rel = filePath?.startsWith(cwd) ? filePath.slice(cwd.length) : filePath;

  body += `\n### \`${rel}\`\n`;
  body += `| Line | Col | Rule | Severity | Message |\n`;
  body += `|-----:|----:|------|----------|---------|\n`;

  for (const m of messages) {
    const sev = m.severity === 2 ? "error" : "warn";
    const rule = m.ruleId || "(n/a)";
    const line = m.line ?? "-";
    const col = m.column ?? "-";
    const msg = (m.message || "").replace(/\|/g, "\\|");
    body += `| ${line} | ${col} | ${rule} | ${sev} | ${msg} |\n`;
  }
}

if (totalErrors === 0 && totalWarnings === 0) {
  console.log(
    "[eslint-to-issues] No ESLint problems. Skipping issue creation."
  );
  process.exit(0);
}

const titleBase = `[ESLint] ${totalErrors} error(s), ${totalWarnings} warning(s) detected`;
const title = PR_NUMBER ? `${titleBase} on PR #${PR_NUMBER}` : titleBase;
const labels = ["lint", "eslint", "ai-review"];

// === Helpers ===
const gh = async (method, url, bodyJson) => {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "eslint-to-issues-ci",
      Accept: "application/vnd.github+json",
    },
    body: bodyJson ? JSON.stringify(bodyJson) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API ${method} ${url} failed: ${res.status} ${text}`
    );
  }
  return res.json();
};

const apiBase = `https://api.github.com/repos/${REPO}`;

// Tìm issue ESLint mở sẵn (tránh spam). Ưu tiên khớp tiêu đề cùng PR nếu có, ngược lại khớp prefix chung.
const findExistingIssue = async () => {
  const params = new URLSearchParams({
    state: "open",
    per_page: "100",
  });
  const list = await gh("GET", `${apiBase}/issues?${params.toString()}`);
  const byExactTitle = list.find((i) => i.title === title);
  if (byExactTitle) return byExactTitle;

  // fallback: match by prefix "[ESLint]" và có label "eslint"
  const byPrefix = list.find(
    (i) =>
      i.title?.startsWith("[ESLint]") &&
      Array.isArray(i.labels) &&
      i.labels.some((l) => (typeof l === "string" ? l : l.name) === "eslint")
  );
  return byPrefix || null;
};

const ensureLabels = async () => {
  // labels sẽ tự tạo nếu chưa tồn tại khi tạo issue (GitHub cho phép).
  return;
};

const main = async () => {
  await ensureLabels();

  const existing = await findExistingIssue();
  const bodyWithTotals = `${body}\n\n---\n**Totals:** \`${totalErrors}\` error(s), \`${totalWarnings}\` warning(s).`;

  if (existing) {
    // Cập nhật issue cũ
    console.log(
      `[eslint-to-issues] Updating existing issue #${existing.number}`
    );
    await gh("PATCH", `${apiBase}/issues/${existing.number}`, {
      title,
      body: bodyWithTotals,
      labels,
    });
  } else {
    // Tạo issue mới
    console.log("[eslint-to-issues] Creating a new ESLint issue…");
    await gh("POST", `${apiBase}/issues`, {
      title,
      body: bodyWithTotals,
      labels,
    });
  }
};

main().catch((e) => {
  console.error("[eslint-to-issues] Error:", e.message);
  // Không fail job AI review chỉ vì tạo issue lỗi:
  process.exit(0);
});
