import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateToAdmin?: () => void;
  onNavigateToCampaigns?: () => void;
  onNavigateToCreate?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToAdmin,
  onNavigateToCampaigns,
  onNavigateToCreate,
}) => {
  return (
    <footer className="border-t border-border bg-surface mt-16 text-zinc-600 dark:text-zinc-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm">
                ለ
              </div>
              <span className="font-bold text-primary tracking-tight text-base">Lewegene · ለወገኔ</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
              Ethiopia’s transparent community fundraising platform. Supporting healthcare, emergency relief, and civic mutual aid with direct digital settlements.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Payments in ETB verified via Telebirr and CBE Birr</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <button
                  onClick={onNavigateToCampaigns}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  All Fundraisers
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToCreate}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Start a Campaign
                </button>
              </li>
              <li>
                <span className="text-zinc-400">How Giving Works</span>
              </li>
              <li>
                <span className="text-zinc-400">Trust & Safety</span>
              </li>
            </ul>
          </div>

          {/* Community & Moderation */}
          <div>
            <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <span className="text-zinc-500">Telebirr & CBE Birr Rails</span>
              </li>
              <li>
                <span className="text-zinc-500">Voice Assistant Support</span>
              </li>
              {onNavigateToAdmin && (
                <li className="pt-2">
                  <button
                    onClick={onNavigateToAdmin}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline cursor-pointer"
                  >
                    Moderation Console
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()} Lewegene. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with mutual solidarity for Ethiopian communities</span>
            <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
