// Adds the "START A FUNDRAISER" tab to BanknoteMasterCanvas.tsx (4 small edits).
// Run once from the project folder:   node src/features/fundraising/apply-nav.mjs
// Undo anytime with:                  git restore src/components/banknote/BanknoteMasterCanvas.tsx
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(here, '../../components/banknote/BanknoteMasterCanvas.tsx');
let raw = fs.readFileSync(file, 'utf8');
const crlf = raw.includes('\r\n');
let s = raw.replace(/\r\n/g, '\n');

if (s.includes('FundraisingApp')) {
  console.log('Already applied. Nothing to do.');
  process.exit(0);
}

function must(cond, msg) {
  if (!cond) {
    console.error('STOPPED: ' + msg + '\nNothing was changed.');
    process.exit(1);
  }
}

// 1. import
const importAnchor = /import \{ FoundationDashboardPage \} from '[^']+';\n/;
must(importAnchor.test(s), 'could not find the FoundationDashboardPage import.');
s = s.replace(importAnchor, (m) => m + "import FundraisingApp from '../../features/fundraising/FundraisingApp.tsx';\n");

// 2. view type
must(/\| 'audit';/.test(s), "could not find the BanknoteZoomMode type (| 'audit';).");
s = s.replace(/\| 'audit';/, "| 'audit'\n  | 'fundraise';");

// 3. nav button, right after the FOUNDATION DESK button
const navAnchor = /(\n\s*FOUNDATION DESK\n\s*<\/button>\n)/;
must(navAnchor.test(s), 'could not find the FOUNDATION DESK nav button.');
const button = `
            <button
              type="button"
              onClick={() => setZoomMode('fundraise')}
              className={\`px-3 py-2 transition-colors cursor-pointer \${
                zoomMode === 'fundraise'
                  ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
              }\`}
            >
              START A FUNDRAISER
            </button>
`;
s = s.replace(navAnchor, (m) => m + button);

// 4. the view
const viewAnchor = "{zoomMode === 'treasury' && (";
must(s.split(viewAnchor).length === 2, "could not find exactly one place for the new view.");
const view = `{zoomMode === 'fundraise' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16 animate-in fade-in duration-300">
            <FundraisingApp />
          </div>
        )}

        `;
s = s.replace(viewAnchor, view + viewAnchor);

fs.writeFileSync(file, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('Done. Added the START A FUNDRAISER tab.');
