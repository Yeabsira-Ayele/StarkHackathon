import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronDown, FlaskConical } from 'lucide-react';
import { useAuthStore } from '../store/auth.store.ts';
import { DEMO_ACCOUNTS, DEMO_SESSION_TOKEN, DemoRole } from '../data/demoAccounts.ts';

const ROLE_DESTINATIONS: Record<DemoRole, string> = {
  donor: '/profile',
  fundraiser: '/fundraising',
  admin: '/admin',
};

const ROLE_LABELS: Record<DemoRole, string> = {
  donor: 'Donor',
  fundraiser: 'Fundraiser',
  admin: 'Admin',
};

export const DemoRoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [open, setOpen] = useState(false);
  const selectedRole: DemoRole | null = user?.id === DEMO_ACCOUNTS.donor.id
    ? 'donor'
    : user?.id === DEMO_ACCOUNTS.fundraiser.id
      ? 'fundraiser'
      : user?.id === DEMO_ACCOUNTS.admin.id
        ? 'admin'
        : null;

  if (location.pathname.startsWith('/demo')) return null;

  const selectRole = (role: DemoRole) => {
    setUser(DEMO_ACCOUNTS[role], DEMO_SESSION_TOKEN);
    setOpen(false);
    navigate(ROLE_DESTINATIONS[role]);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[80] font-mono">
      {open && (
        <div className="mb-2 w-60 border border-[#9A7432]/50 bg-[#FFFDF9] p-2 shadow-xl dark:bg-[#12100E]">
          <p className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#9A7432]">Choose a local demo account</p>
          {(Object.keys(DEMO_ACCOUNTS) as DemoRole[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => selectRole(role)}
              className="flex w-full items-center justify-between px-2 py-2 text-left text-xs font-bold text-[#201C18] hover:bg-[#F2ECE1] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
            >
              <span>{ROLE_LABELS[role]}</span>
              {selectedRole === role && <span className="text-[9px] text-[#1E4D38] dark:text-[#52B788]">ACTIVE</span>}
            </button>
          ))}
          <p className="border-t border-[#26211C]/10 px-2 pt-2 text-[9px] leading-relaxed text-zinc-500">
            Demo state stays in this browser. No real sign-in, payments, or backend.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-[#9A7432]/60 bg-[#FFFDF9]/95 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#201C18] shadow-lg backdrop-blur dark:bg-[#12100E]/95 dark:text-[#F4EFE6]"
      >
        <FlaskConical className="h-3.5 w-3.5 text-[#9A7432]" />
        Demo: {selectedRole ? ROLE_LABELS[selectedRole] : 'Choose role'}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
