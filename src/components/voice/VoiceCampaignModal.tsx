import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { CampaignCategory } from '../../types/index.ts';
import { CheckCircle2, Edit3, Mic, Sparkles } from 'lucide-react';

export interface VoiceCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName?: string;
  } | null;
  onConfirm: (data: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName: string;
  }) => void;
  isLoading?: boolean;
}

export const VoiceCampaignModal: React.FC<VoiceCampaignModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onConfirm,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [goalAmount, setGoalAmount] = useState<number>(50000);
  const [category, setCategory] = useState<CampaignCategory>('medical');
  const [creatorName, setCreatorName] = useState('Anonymous');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setStory(initialData.story);
      setGoalAmount(initialData.goalAmount);
      setCategory(initialData.category);
      setCreatorName(initialData.creatorName || 'Anonymous');
      setIsEditing(false);
    }
  }, [initialData]);

  if (!initialData) return null;

  const categoryOptions = [
    { value: 'medical', label: 'Medical (የህክምና እርዳታ)' },
    { value: 'education', label: 'Education (የትምህርት ድጋፍ)' },
    { value: 'emergency', label: 'Emergency Relief (የአደጋ ጊዜ)' },
    { value: 'business', label: 'Community / Artisans (የስራ ማስጀመሪያ)' },
    { value: 'other', label: 'Other (ሌላ)' },
  ];

  const handleConfirm = () => {
    onConfirm({
      title,
      story,
      goalAmount: Number(goalAmount),
      category,
      creatorName,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-accent rounded-lg">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">
              Confirm Campaign Details
            </h3>
            <span className="text-xs text-zinc-500 font-normal">
              Review extracted information before publishing.
            </span>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Publish
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-xs text-primary leading-relaxed">
            Please confirm the details parsed from your voice input before publishing to the feed.
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-2">
            <Input
              label="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hawassa High School STEM textbooks"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Goal Amount (ETB)"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value))}
                suffix="ETB"
              />
              <Select
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value as CampaignCategory)}
              />
            </div>
            <Input
              label="Organizer Name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your name or community group"
            />
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Story & Details
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full text-sm rounded-lg border border-border bg-surface p-3 text-primary placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-border rounded-xl p-4 divide-y divide-border text-sm">
            <div className="pb-3">
              <span className="text-xs text-zinc-500 font-medium">Campaign Title</span>
              <p className="font-semibold text-primary mt-0.5">{title}</p>
            </div>
            <div className="py-2.5 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Goal</span>
                <p className="font-bold text-primary mt-0.5 tabular-nums">
                  {Number(goalAmount).toLocaleString()} ETB
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-medium">Category</span>
                <p className="font-semibold text-primary mt-0.5 capitalize">{category}</p>
              </div>
            </div>
            <div className="py-2.5">
              <span className="text-xs text-zinc-500 font-medium">Organizer</span>
              <p className="font-medium text-primary mt-0.5">{creatorName}</p>
            </div>
            <div className="pt-2.5">
              <span className="text-xs text-zinc-500 font-medium">Story</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-3">
                {story}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
