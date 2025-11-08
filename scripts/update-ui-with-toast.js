const fs = require('fs');
const path = require('path');

/**
 * Script to automatically update UI files with Toast and ConfirmDialog
 * Replaces window.alert/confirm and success/error message states
 */

const filesToUpdate = [
  // DealerStaff pages
  'src/pages/dealerStaff/CustomerManagement.jsx',
  'src/pages/dealerStaff/FeedbackManagement.jsx',
  'src/pages/dealerStaff/Inventory.jsx',
  'src/pages/dealerStaff/PaymentManagement.jsx',
  'src/pages/dealerStaff/TestDriveSchedule.jsx',
  'src/pages/dealerStaff/CreateOrder.jsx',
  
  // DealerManager pages  
  'src/pages/dealerManager/InventoryManagement.jsx',
  'src/pages/dealerManager/OrderManagement.jsx',
  'src/pages/dealerManager/PromotionManagement.jsx',
  'src/pages/dealerManager/QuanLyNhanVien.jsx',
  'src/pages/dealerManager/QuanLyCongNo.jsx',
  
  // Admin pages
  'src/pages/admin/UserManagement.jsx',
  'src/pages/admin/StoreManagement.jsx',
  
  // EVMStaff pages
  'src/pages/EvmStaff/VehicleManagement.jsx',
  'src/pages/EvmStaff/ProductManagement.jsx',
  'src/pages/EvmStaff/DealerOrderManagement.jsx',
];

const importsToAdd = `import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';`;

const hooksToAdd = `  // Modern UI hooks
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  `;

const jsxToAdd = `      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
`;

function updateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already updated
  if (content.includes('useToast') && content.includes('useConfirm')) {
    console.log(`✅ Already updated: ${filePath}`);
    return;
  }
  
  let modified = false;
  
  // 1. Add imports after existing imports (after lucide-react typically)
  if (!content.includes('useToast')) {
    const importMatch = content.match(/(} from ['"]lucide-react['"];?\s*)/);
    if (importMatch) {
      content = content.replace(importMatch[0], importMatch[0] + '\n' + importsToAdd + '\n');
      modified = true;
    }
  }
  
  // 2. Replace useState for messages with hooks
  if (content.includes('useState(null);') && content.includes('successMessage')) {
    // Find the component function
    const functionMatch = content.match(/function\s+\w+\s*\(\)\s*{/);
    if (functionMatch) {
      const insertPos = content.indexOf('{', functionMatch.index) + 1;
      content = content.slice(0, insertPos) + '\n' + hooksToAdd + content.slice(insertPos);
      
      // Remove old state declarations
      content = content.replace(/\s*const \[successMessage,\s*setSuccessMessage\]\s*=\s*useState\(null\);?/g, '');
      content = content.replace(/\s*const \[errorMessage,\s*setErrorMessage\]\s*=\s*useState\(null\);?/g, '');
      modified = true;
    }
  }
  
  // 3. Replace setSuccessMessage with success()
  content = content.replace(/setSuccessMessage\(([^)]+)\);?\s*setTimeout\(\(\)\s*=>\s*setSuccessMessage\(null\),\s*\d+\);?/g, 'success($1);');
  content = content.replace(/setSuccessMessage\(([^)]+)\);?/g, 'success($1);');
  
  // 4. Replace setErrorMessage with showError()
  content = content.replace(/setErrorMessage\(([^)]+)\);?\s*setTimeout\(\(\)\s*=>\s*setErrorMessage\(null\),\s*\d+\);?/g, 'showError($1);');
  content = content.replace(/setErrorMessage\(([^)]+)\);?/g, 'showError($1);');
  
  // 5. Replace window.alert with showError
  content = content.replace(/window\.alert\(([^)]+)\);?/g, 'showError($1);');
  content = content.replace(/alert\(([^)]+)\);?/g, 'showError($1);');
  
  // 6. Replace window.confirm with showConfirm (simple cases)
  const confirmMatches = content.matchAll(/if\s*\(\s*!?window\.confirm\(([^)]+)\)\s*\)\s*{?\s*return;?\s*}?/g);
  for (const match of confirmMatches) {
    const confirmCall = `const confirmed = await showConfirm({
      message: ${match[1]},
      type: 'warning'
    });
    if (!confirmed) return;`;
    content = content.replace(match[0], confirmCall);
    modified = true;
  }
  
  // 7. Add Toast and ConfirmDialog JSX to return statement
  if (!content.includes('<Toast')) {
    // Find return statement with JSX
    const returnMatch = content.match(/return\s*\(\s*<div/);
    if (returnMatch) {
      const divPos = content.indexOf('<div', returnMatch.index);
      content = content.slice(0, divPos) + jsxToAdd + '\n' + content.slice(divPos);
      modified = true;
    }
  }
  
  // 8. Remove success/error message JSX
  content = content.replace(/{\/\*\s*Success[^}]*Message[^}]*\*\/}[\s\S]*?{successMessage[\s\S]*?<\/div>\s*\)\s*}/g, '');
  content = content.replace(/{\/\*\s*Error[^}]*Message[^}]*\*\/}[\s\S]*?{[\s(]*error\s*\|\|\s*errorMessage[\s\S]*?<\/div>\s*\)\s*}/g, '');
  
  // 9. Remove tooltip title attributes
  content = content.replace(/title="[^"]*"/g, '');
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✨ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

// Run updates
console.log('🚀 Starting UI modernization...\n');
filesToUpdate.forEach(updateFile);
console.log('\n✅ Done!');

