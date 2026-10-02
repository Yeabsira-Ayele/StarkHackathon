import React, { useState } from 'react';
import { Donation } from '../types/donation.types';
import { Copy, Check, X, Share2, Send, MessageCircle } from 'lucide-react';

interface ShareDonationModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDonationModal: React.FC<ShareDonationModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<boolean>(false);

  const shareUrl = `${window.location.origin}/?campaignId=${donation.campaignId}`;
  const shareText = `I just underwrote ${donation.amount.toLocaleString()} ETB to "${donation.campaignTitle || 'a verified civic cause'}" on Lewegene Ethiopian Crowdfunding! Join in solidarity:`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 sm:p-8 border-4 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 font-mono text-xs rounded-[1px] shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-[#1E4D38] dark:text-[#52B788] tracking-widest block">
            SPREAD SOLIDARITY
          </span>
          <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
            Share Your Contribution
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
            Encourage your friends, diaspora circle, and community to support this verified cause.
          </p>
        </div>

        {/* Preview Card */}
        <div className="p-4 border-2 border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#EFE7D5] dark:bg-[#181512] space-y-2 rounded-[1px]">
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
            MESSAGE PREVIEW
          </span>
          <p className="text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed italic">
            "{shareText}"
          </p>
        </div>

        {/* Quick Social Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleTelegramShare}
            className="p-3 border-2 border-[#0088cc] bg-[#0088cc]/10 text-[#0088cc] font-bold text-center uppercase cursor-pointer hover:bg-[#0088cc] hover:text-white transition-colors rounded-[1px] flex flex-col items-center justify-center gap-1"
          >
            <Send className="w-4 h-4" />
            <span className="text-[10px]">TELEGRAM</span>
          </button>

          <button
            type="button"
            onClick={handleTwitterShare}
            className="p-3 border-2 border-[#1DA1F2] bg-[#1DA1F2]/10 text-[#1DA1F2] font-bold text-center uppercase cursor-pointer hover:bg-[#1DA1F2] hover:text-white transition-colors rounded-[1px] flex flex-col items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px]">X / TWITTER</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-3 border-2 border-[#25D366] bg-[#25D366]/10 text-[#25D366] font-bold text-center uppercase cursor-pointer hover:bg-[#25D366] hover:text-white transition-colors rounded-[1px] flex flex-col items-center justify-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px]">WHATSAPP</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase text-zinc-500">
            OR COPY DIRECT SHARE LINK:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 p-2.5 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#1C1814] text-xs text-zinc-600 dark:text-zinc-300 font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 border-2 font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-[#1E4D38] bg-[#1E4D38] text-white hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
