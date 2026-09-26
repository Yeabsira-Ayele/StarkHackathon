import React from 'react';
import { ShieldCheck, Heart, Award, Building2 } from 'lucide-react';

interface FooterProps {
  onNavigateToCampaigns?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToDonorDashboard?: () => void;
  onNavigateToFoundation?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToCampaigns,
  onNavigateToCreate,
  onNavigateToDonorDashboard,
  onNavigateToFoundation,
}) => {
  return (
    <footer className="border-t border-[#D8CEBA]/80 dark:border-[#313C36] bg-surface mt-16 text-zinc-600 dark:text-zinc-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#173C32] to-[#B08A45] text-white flex items-center justify-center font-display font-bold text-sm shadow-xs">
                ለ
              </div>
              <div>
                <span className="font-display font-bold text-primary tracking-tight text-base block">
                  LEWEGENE · ለወገን
                </span>
                <span className="text-[10px] text-accent font-ethiopic font-semibold">
                  የኢትዮጵያ ማህበረሰብ ድጋፍ መድረክ
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed font-sans">
              Ethiopian heritage × old-money digital philanthropy. Connecting compassionate local donors and global diaspora with verified foundations through audited Birr settlements.
            </p>

            <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1 font-mono">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>ACSO Certified · Direct Telebirr &amp; CBE Birr Escrow Rails</span>
            </div>
          </div>

          {/* Donor Links */}
          <div>
            <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 font-display">
              Supporter Portal
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <button
                  onClick={onNavigateToCampaigns}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Explore Causes
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToDonorDashboard}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  My Impact &amp; Certificates
                </button>
              </li>
              <li>
                <span className="text-zinc-400">Archival Contribution Receipts</span>
              </li>
              <li>
                <span className="text-zinc-400">Zero-Fee Giving Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Foundation Links */}
          <div>
            <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 font-display">
              Foundations &amp; NGOs
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <button
                  onClick={onNavigateToFoundation}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Foundation Console
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToCreate}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Publish New Cause
                </button>
              </li>
              <li>
                <span className="text-zinc-400">ACSO Institutional Verification</span>
              </li>
              <li>
                <span className="text-zinc-400">Audited Milestone Reporting</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#D8CEBA]/60 dark:border-[#313C36] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()} Lewegene Philanthropy. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Award className="w-3.5 h-3.5 text-accent" />
            <span>Preserving Heritage · Inspiring Compassion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
