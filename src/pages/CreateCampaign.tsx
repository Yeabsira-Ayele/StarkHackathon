import React, { useState } from 'react';
import { APP_NAME } from '../data/content.ts';
import { Campaign, CampaignCategory } from '../types/index.ts';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import {
  Mic,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Eye,
  FileText,
  DollarSign,
  Award,
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
    impactMetric?: string;
    beneficiariesTarget?: number;
  }, autoApprove: boolean) => Promise<any>;
  onOpenVoice: () => void;
  language: 'en' | 'am' | 'om';
}

export const CreateCampaign: React.FC<CreateCampaignProps> = ({
  onBack,
  onSubmit,
  onOpenVoice,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CampaignCategory>('education');
  const [location, setLocation] = useState('Addis Ababa, Ethiopia');
  const [creatorName, setCreatorName] = useState('Tikur Anbessa Pediatric Health Trust');
  const [story, setStory] = useState('');
  const [goalAmount, setGoalAmount] = useState<string>('95000');
  const [impactMetric, setImpactMetric] = useState('Supplies 300 textbooks and laboratory kits for 640 students');
  const [beneficiariesTarget, setBeneficiariesTarget] = useState<number>(640);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/ethiopia_school_stem_1790266427111.jpg');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetImages = [
    { label: 'Education & STEM', url: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg' },
    { label: 'Healthcare & Surgery', url: '/src/assets/images/ethiopia_medical_care_1790266416218.jpg' },
    { label: 'Clean Water & Solar', url: '/src/assets/images/ethiopia_clean_water_1790266442202.jpg' },
    { label: 'Traditional Artisans', url: '/src/assets/images/ethiopia_artisan_craft_1790266455378.jpg' },
  ];

  const handlePublish = async () => {
    if (!title.trim() || !story.trim()) {
      setError('Please provide a complete title and story.');
      return;
    }
    const numGoal = parseFloat(goalAmount);
    if (isNaN(numGoal) || numGoal <= 0) {
      setError('Please enter a valid goal amount in ETB.');
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
          creatorName: creatorName.trim() || 'Verified Organization',
          location: location.trim() || 'Ethiopia',
          imageUrl,
          impactMetric: impactMetric.trim(),
          beneficiariesTarget: beneficiariesTarget || 100,
        },
        true // Auto approve for instant discovery in connected demo!
      );
    } catch (err: any) {
      setError(err.message || 'Failed to publish campaign.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <button
          type="button"
          onClick={onOpenVoice}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-zinc-800 text-accent text-xs font-semibold hover:border-accent transition-all cursor-pointer shadow-xs"
        >
          <Mic className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Fill with Voxide Voice Assistant</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/40 bg-surface text-accent text-xs font-semibold font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>Curated Philanthropic Publishing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
          Publish a Community Cause on {APP_NAME}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Craft your cause, transparent budget, and target impact before publishing to the public feed
        </p>
      </div>

      {/* Progress Step Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentStep === 1 ? 'bg-accent text-[#1C1A17]' : 'text-zinc-500 hover:text-primary'
          }`}
        >
          1. Basic Details
        </button>
        <span className="text-zinc-300">·</span>
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentStep === 2 ? 'bg-accent text-[#1C1A17]' : 'text-zinc-500 hover:text-primary'
          }`}
        >
          2. Story &amp; Urgency
        </button>
        <span className="text-zinc-300">·</span>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentStep === 3 ? 'bg-accent text-[#1C1A17]' : 'text-zinc-500 hover:text-primary'
          }`}
        >
          3. Funding &amp; Impact
        </button>
        <span className="text-zinc-300">·</span>
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            currentStep === 4 ? 'bg-accent text-[#1C1A17]' : 'text-zinc-500 hover:text-primary'
          }`}
        >
          4. Live Preview &amp; Publish
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-700 dark:text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-bold text-primary">Core Project Identification</h2>
          
          <div>
            <label className="block font-semibold text-primary mb-1">Cause Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern STEM Laboratory Kits for Hawassa Community High"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
              >
                <option value="education">Education &amp; Schools</option>
                <option value="medical">Healthcare &amp; Surgeries</option>
                <option value="emergency">Emergency Relief</option>
                <option value="water">Clean Water &amp; Sanitation</option>
                <option value="business">Traditional Artisans &amp; Weavers</option>
                <option value="environment">Environment &amp; Agriculture</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Target Location in Ethiopia</label>
              <input
                type="text"
                required
                placeholder="e.g. Hawassa, Sidama or Addis Ababa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-primary mb-1">Publishing Organization / Lead</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block font-semibold text-primary mb-2">Select Verified Cover Photo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    imageUrl === img.url ? 'border-accent shadow-sm' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-18 object-cover" />
                  <p className="text-[10px] text-center py-1 font-semibold text-primary bg-surface-alt">
                    {img.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="accent"
              size="md"
              onClick={() => {
                if (!title.trim()) {
                  setError('Please enter a title');
                  return;
                }
                setError(null);
                setCurrentStep(2);
              }}
              icon={<ArrowRight className="w-4 h-4 text-[#1C1A17]" />}
              iconPosition="right"
            >
              Continue to Story
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Story & Urgency */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-bold text-primary">Articulate the Need &amp; Problem</h2>
          <p className="text-zinc-500">
            Explain the human context, why immediate donor intervention is vital, and how funds will be deployed.
          </p>

          <div>
            <label className="block font-semibold text-primary mb-1">The Need &amp; Story *</label>
            <textarea
              rows={6}
              required
              placeholder="Describe the background of the beneficiaries, current hardships, and the concrete plan of action..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent leading-relaxed"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={() => {
                if (!story.trim()) {
                  setError('Please write a story');
                  return;
                }
                setError(null);
                setCurrentStep(3);
              }}
              icon={<ArrowRight className="w-4 h-4 text-[#1C1A17]" />}
              iconPosition="right"
            >
              Continue to Funding Goal
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Funding & Impact Metrics */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-bold text-primary">Funding Goal &amp; Beneficiaries</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-primary mb-1">Funding Target (ETB) *</label>
              <input
                type="number"
                required
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Target Beneficiaries Count</label>
              <input
                type="number"
                value={beneficiariesTarget}
                onChange={(e) => setBeneficiariesTarget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-primary mb-1">Summary Impact Metric</label>
            <input
              type="text"
              placeholder="e.g. 640 students receive laboratory glassware and textbooks"
              value={impactMetric}
              onChange={(e) => setImpactMetric(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={() => setCurrentStep(4)}
              icon={<Eye className="w-4 h-4 text-[#1C1A17]" />}
              iconPosition="right"
            >
              Preview Cause Before Publishing
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Live Preview & Publish */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-zinc-800 text-xs flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-primary">Live Donor Preview Mode</p>
              <p className="text-zinc-500">This is exactly how donors and supporters will see your cause</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                Edit Details
              </Button>
              <Button
                variant="accent"
                size="md"
                isLoading={isSubmitting}
                onClick={handlePublish}
                icon={<CheckCircle2 className="w-4 h-4 text-[#1C1A17]" />}
              >
                Publish Cause Immediately
              </Button>
            </div>
          </div>

          {/* Render Full Cause Detail Mock Preview */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-sm space-y-6">
            <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden border border-border">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs text-primary border border-border rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Verified Foundation</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span className="font-bold text-accent">LW-NEW</span>
                <span>·</span>
                <span className="capitalize">{category}</span>
                <span>·</span>
                <span>{location}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                {title || 'Untitled Cause'}
              </h2>
              <p className="text-xs text-zinc-500">Published by {creatorName}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-alt/50 dark:bg-zinc-800/40 border border-border space-y-2">
              <ProgressBar value={0} max={parseFloat(goalAmount) || 100000} size="md" color="accent" showLabel />
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-bold text-primary">0 ETB raised</span>
                <span className="text-zinc-500">Goal: {(parseFloat(goalAmount) || 100000).toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <h3 className="text-sm font-bold text-primary">About this Intervention</h3>
              <p className="whitespace-pre-line">{story || 'Story description...'}</p>
            </div>

            <div className="p-4 rounded-xl border border-[#B08A45]/30 bg-[#F7F4EB]/60 dark:bg-zinc-800/30 text-xs">
              <span className="font-semibold text-accent">Expected Tangible Impact: </span>
              <span>{impactMetric}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
