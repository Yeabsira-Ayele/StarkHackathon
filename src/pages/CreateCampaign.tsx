import React, { useState } from 'react';
import { CampaignCategory } from '../types/index.ts';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import {
  Mic,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

export interface CreateCampaignProps {
  onBack: () => void;
  onSubmit: (payload: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName: string;
    location: string;
    imageUrl?: string;
  }, autoApprove: boolean) => Promise<any>;
  onOpenVoice: () => void;
  language: 'en' | 'am' | 'om';
}

export const CreateCampaign: React.FC<CreateCampaignProps> = ({
  onBack,
  onSubmit,
  onOpenVoice,
}) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [goalAmount, setGoalAmount] = useState<string>('50000');
  const [category, setCategory] = useState<CampaignCategory>('medical');
  const [creatorName, setCreatorName] = useState('');
  const [location, setLocation] = useState('Addis Ababa, Ethiopia');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/ethiopia_clean_water_1790266442202.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = [
    { value: 'medical', label: 'Medical Emergency (የህክምና እርዳታ)' },
    { value: 'education', label: 'Education & Schools (የትምህርት ድጋፍ)' },
    { value: 'emergency', label: 'Disaster Relief (የአደጋ ጊዜ)' },
    { value: 'business', label: 'Community Initiative (የማህበረሰብ ስራ)' },
    { value: 'other', label: 'Other (ሌላ)' },
  ];

  const presetImages = [
    { label: 'Clean Water', url: '/src/assets/images/ethiopia_clean_water_1790266442202.jpg' },
    { label: 'Medical Care', url: '/src/assets/images/ethiopia_medical_care_1790266416218.jpg' },
    { label: 'Education', url: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg' },
    { label: 'Artisans', url: '/src/assets/images/ethiopia_artisan_craft_1790266455378.jpg' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a campaign title.');
      return;
    }
    if (!story.trim()) {
      setError('Please enter your story explaining the need.');
      return;
    }
    const numGoal = parseFloat(goalAmount);
    if (isNaN(numGoal) || numGoal <= 0) {
      setError('Goal amount must be greater than 0 ETB.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(
        {
          title: title.trim(),
          story: story.trim(),
          goalAmount: numGoal,
          category,
          creatorName: creatorName.trim() || 'Anonymous',
          location: location.trim() || 'Ethiopia',
          imageUrl,
        },
        true // Automatically publish the campaign
      );
    } catch (err: any) {
      setError(err.message || 'Failed to publish campaign.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to campaigns</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Start a Fundraiser
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Create a campaign for medical, emergency, or community support.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenVoice}
          className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-accent rounded-lg text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Speak with Voice Assistant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-border p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campaign Title"
              placeholder="e.g. Clean Water Filter Installation in Woliso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value as CampaignCategory)}
              />

              <Input
                label="Target Goal (ETB)"
                type="number"
                min="100"
                placeholder="50000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                suffix="ETB"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organizer Name"
                placeholder="e.g. Dr. Henok Girma"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                helperText="Leave empty to display as Anonymous"
              />

              <Input
                label="Location"
                placeholder="e.g. Addis Ababa, Ethiopia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Photo Selection */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Campaign Cover Image</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetImages.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className={`relative rounded-lg overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${
                      imageUrl === img.url
                        ? 'border-accent ring-2 ring-indigo-100 dark:ring-indigo-950'
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] font-medium py-0.5 px-1 rounded text-center truncate">
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Story & Details
              </label>
              <textarea
                rows={5}
                placeholder="Explain what the fundraiser is for, who benefits, and how the funds will be used..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-border bg-surface p-3 text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent leading-relaxed"
                required
              />
            </div>

            {error && <p className="text-xs font-medium text-error">{error}</p>}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold"
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Publish Campaign
            </Button>
          </form>
        </div>

        {/* Live Card Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Card Preview</span>
          </div>

          <Card className="overflow-hidden border-border shadow-xs">
            <div className="relative aspect-16/10 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span className="text-accent font-semibold capitalize">{category}</span>
                <span>·</span>
                <span>{location || 'Ethiopia'}</span>
              </div>

              <h3 className="text-sm font-bold text-primary line-clamp-2">
                {title || 'Campaign Title'}
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {story || 'The story excerpt will display here as you type...'}
              </p>

              <div className="pt-3 border-t border-border space-y-1.5">
                <ProgressBar percentage={0} size="sm" color="accent" />
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-primary">0 ETB raised</span>
                  <span className="text-zinc-500">
                    Goal: {parseFloat(goalAmount) ? parseFloat(goalAmount).toLocaleString() : '0'} ETB
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 pt-1">
                  By {creatorName || 'Anonymous'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
