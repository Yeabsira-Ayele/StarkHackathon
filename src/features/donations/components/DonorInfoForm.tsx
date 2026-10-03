import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, User, Mail, MessageSquare } from 'lucide-react';

interface DonorInfoFormProps {
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  donorMessage: string;
  onChangeName: (name: string) => void;
  onChangeEmail: (email: string) => void;
  onChangeAnonymous: (anon: boolean) => void;
  onChangeMessage: (msg: string) => void;
}

export const DonorInfoForm: React.FC<DonorInfoFormProps> = ({
  donorName,
  donorEmail,
  isAnonymous,
  donorMessage,
  onChangeName,
  onChangeEmail,
  onChangeAnonymous,
  onChangeMessage,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h3 className="font-serif font-black text-xl text-[#14110E] dark:text-[#FFFFFF]">
          {t('donations.step2', 'Donor Information')}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Add a name for the local prototype record or choose to remain anonymous.
        </p>
      </div>

      <div className="space-y-4">
        {/* Donor Name Field */}
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
            <span>{t('donations.patronName', 'Donor Full Name')}:</span>
          </label>
          <input
            type="text"
            disabled={isAnonymous}
            value={isAnonymous ? 'Anonymous Patron' : donorName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g. Almaz Bekele"
            className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] transition-colors"
          />

          {/* Anonymous Checkbox */}
          <div className="mt-2.5 p-3 border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#F2ECE1]/60 dark:bg-[#1C1814]/60 flex items-start gap-2.5 cursor-pointer rounded-[1px]">
            <input
              id="anonymous-checkbox"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => onChangeAnonymous(e.target.checked)}
              className="mt-0.5 accent-[#1E4D38] cursor-pointer"
            />
            <label htmlFor="anonymous-checkbox" className="cursor-pointer text-[#14110E] dark:text-[#E8DEC8]">
              <span className="font-black uppercase block">
                {t('donations.anonymous', 'Keep my contribution anonymous')}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                Your name will not appear on the public donor roll or cause ledger.
              </span>
            </label>
          </div>
        </div>

        {/* Donor Email Field */}
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
            <span>Email Address (optional; not sent):</span>
          </label>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="e.g. donor@gmail.com"
            className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] transition-colors"
          />
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Optional. This frontend prototype does not send email or verification updates.
          </span>
        </div>

        {/* Solidarity Note / Encouraging Message */}
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
            <span>{t('donations.message', 'Solidarity Message or Note')}:</span>
          </label>
          <textarea
            rows={3}
            value={donorMessage}
            onChange={(e) => onChangeMessage(e.target.value)}
            placeholder="Write words of encouragement or a prayer for the beneficiary..."
            className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
