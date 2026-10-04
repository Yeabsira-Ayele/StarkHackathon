import React, { useState, useMemo } from 'react';
import { Button, Card, FieldError, Input, Label, Select, fieldClass } from './bn.tsx';
import { ArrowLeft, ArrowRight, Save, Trash2, Upload, Plus, Building2 } from 'lucide-react';
import type { BeneficiaryType, DocumentKind, FormErrors, FundraiserFormValues, BankAccount } from '../types/fundraiser.types.ts';
import { validate } from '../schemas/fundraiser.schema.ts';
import { useBanks } from '../hooks/useBanks.ts';
import { useCategories } from '../hooks/useCategories.ts';
import { useOrganizations } from '../hooks/useOrganizations.ts';
import { DISCOVER_LOCATIONS } from '../../../services/lookupService.ts';

const MAX_IMAGES = 4;
const MAX_IMAGE_KB = 700;
const MAX_DOCUMENTS = 3;

const PRESET_IMAGES = [
  { label: 'Education', url: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg' },
  { label: 'Medical', url: '/src/assets/images/ethiopia_medical_care_1790266416218.jpg' },
  { label: 'Water', url: '/src/assets/images/ethiopia_clean_water_1790266442202.jpg' },
  { label: 'Craft', url: '/src/assets/images/ethiopia_artisan_craft_1790266455378.jpg' },
];

const BENEFICIARY_OPTIONS: { id: BeneficiaryType; label: string; hint: string }[] = [
  { id: 'myself', label: 'Myself', hint: 'You receive the money.' },
  { id: 'friend_family', label: 'Friend or family', hint: 'Someone close to you.' },
  { id: 'community_org', label: 'Community or organization', hint: 'A registered community initiative.' },
  { id: 'other', label: 'Another person', hint: 'Someone you are helping.' },
];

const DOC_KINDS: { value: DocumentKind; label: string }[] = [
  { value: 'supporting_letter', label: 'Supporting letter' },
  { value: 'verification', label: 'Verification document' },
  { value: 'other', label: 'Other evidence' },
];

interface Props {
  initial: FundraiserFormValues;
  /** Approved fundraisers cannot change money-related fields. */
  lockSensitive?: boolean;
  /** Leave undefined to hide the "Save draft" button. */
  onSaveDraft?: (values: FundraiserFormValues) => Promise<void>;
  onContinue: (values: FundraiserFormValues) => Promise<void>;
  continueLabel?: string;
  onBack: () => void;
}

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <Card className="p-5 space-y-4">
    <div>
      <h2 className="font-serif font-black uppercase text-xl text-[#14110E] dark:text-[#F4EFE6]">{title}</h2>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
    </div>
    {children}
  </Card>
);

export const FundraiserForm: React.FC<Props> = ({
  initial,
  lockSensitive = false,
  onSaveDraft,
  onContinue,
  continueLabel = 'Continue',
  onBack,
}) => {
  const [values, setValues] = useState<FundraiserFormValues>(() => {
    const initialBanks =
      initial.banks && initial.banks.length > 0
        ? initial.banks
        : initial.bank?.bankId
          ? [initial.bank]
          : [];
    return {
      ...initial,
      banks: initialBanks,
      bank: initialBanks[0] || initial.bank || { bankId: '', accountNumber: '', accountName: '' },
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [docKind, setDocKind] = useState<DocumentKind>('supporting_letter');

  const banks = useBanks().data;
  const categories = useCategories().data;
  const orgs = useOrganizations().data;

  const set = <K extends keyof FundraiserFormValues>(key: K, value: FundraiserFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const selectedBanks: BankAccount[] = useMemo(() => {
    if (values.banks && values.banks.length > 0) return values.banks;
    if (values.bank?.bankId) return [values.bank];
    return [];
  }, [values.banks, values.bank]);

  const availableUnselectedBanks = useMemo(() => {
    return banks.filter((b) => !selectedBanks.some((sb) => sb.bankId === b.id));
  }, [banks, selectedBanks]);

  const handleAddBank = (bankId: string) => {
    if (!bankId) return;
    if (selectedBanks.some((b) => b.bankId === bankId)) return;
    const defaultAccountName = selectedBanks[0]?.accountName || values.beneficiary?.name || '';
    const newAccount: BankAccount = {
      bankId,
      accountNumber: '',
      accountName: defaultAccountName,
    };
    const updated = [...selectedBanks, newAccount];
    setValues((v) => ({
      ...v,
      banks: updated,
      bank: updated[0],
    }));
  };

  const handleUpdateBank = (index: number, patch: Partial<BankAccount>) => {
    const updated = selectedBanks.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setValues((v) => ({
      ...v,
      banks: updated,
      bank: updated[0] || { bankId: '', accountNumber: '', accountName: '' },
    }));
  };

  const handleRemoveBank = (index: number) => {
    const updated = selectedBanks.filter((_, i) => i !== index);
    setValues((v) => ({
      ...v,
      banks: updated,
      bank: updated[0] || { bankId: '', accountNumber: '', accountName: '' },
    }));
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;
    setNotice(null);
    Array.from(files).forEach((file) => {
      if (file.size > MAX_IMAGE_KB * 1024) {
        setNotice(`${file.name} is larger than ${MAX_IMAGE_KB} KB. Choose a smaller image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        setValues((v) => (v.images.length >= MAX_IMAGES ? v : { ...v, images: [...v.images, String(reader.result)] }));
      reader.readAsDataURL(file);
    });
  };

  const addDocument = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (values.documents.length >= MAX_DOCUMENTS) {
      setNotice(`You can upload a maximum of ${MAX_DOCUMENTS} supporting documents.`);
      return;
    }
    setNotice(null);
    set('documents', [
      ...values.documents,
      { id: `doc-${Date.now()}`, kind: docKind, fileName: file.name, sizeKb: Math.round(file.size / 1024) },
    ]);
  };

  const run = async (mode: 'draft' | 'submit', action: (v: FundraiserFormValues) => Promise<void>) => {
    const found = validate(values, mode);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      await action(values);
    } catch (err: any) {
      setNotice(err.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const needsBeneficiary = values.beneficiaryType === 'friend_family' || values.beneficiaryType === 'other';
  const isCommunity = values.beneficiaryType === 'community_org';

  return (
    <div className="space-y-5">
      <Section title="Basic information">
        <Input
          id="field-title"
          label="Title"
          value={values.title}
          error={errors.title}
          placeholder="Help Abebe pay for medical expenses"
          onChange={(e) => set('title', e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            id="field-category"
            label="Category"
            value={values.category}
            error={errors.category}
            onChange={(e) => set('category', e.target.value as FundraiserFormValues['category'])}
            options={[
              { value: '', label: 'Choose a category' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            id="field-location"
            label="Location"
            value={values.location}
            error={errors.location}
            onChange={(e) => set('location', e.target.value)}
            options={[
              { value: '', label: 'Choose a location' },
              ...DISCOVER_LOCATIONS.map((loc) => ({ value: loc, label: loc })),
            ]}
          />
        </div>
        <div id="field-story">
          <Label htmlFor="story">Story:</Label>
          <textarea
            id="story"
            rows={6}
            value={values.story}
            onChange={(e) => set('story', e.target.value)}
            placeholder="Who needs help, what happened, and how the money will be used."
            className={fieldClass(!!errors.story)}
          />
          <FieldError>{errors.story}</FieldError>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            id="field-goalAmount"
            label="Goal"
            type="number"
            min={1}
            suffix="ETB"
            value={values.goalAmount}
            error={errors.goalAmount}
            disabled={lockSensitive}
            helperText={lockSensitive ? 'The goal cannot change after approval.' : undefined}
            onChange={(e) => set('goalAmount', e.target.value)}
          />
          <Input
            id="field-deadline"
            label="Deadline (optional)"
            type="date"
            value={values.deadline}
            error={errors.deadline}
            disabled={lockSensitive}
            helperText="Leave empty if this cause is ongoing without a fixed cutoff date."
            onChange={(e) => set('deadline', e.target.value)}
          />
        </div>
      </Section>

      <Section title="Images" hint={`Up to ${MAX_IMAGES} images, ${MAX_IMAGE_KB} KB each.`}>
        <div id="field-images" className="flex flex-wrap gap-3">
          {values.images.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Image ${i + 1}`}
                className="w-24 h-24 object-cover border border-[#26211C]/20 dark:border-[#9A7432]/30"
              />
              <button
                type="button"
                aria-label={`Remove image ${i + 1}`}
                onClick={() => set('images', values.images.filter((_, n) => n !== i))}
                className="absolute -top-2 -right-2 bg-[#FFFDF9] dark:bg-[#12100E] border border-[#26211C]/40 dark:border-[#9A7432]/50 p-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-[#1E4D38] dark:text-[#52B788]" />
              </button>
            </div>
          ))}
        </div>
        {values.images.length < MAX_IMAGES && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-wider px-3 py-1.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#12100E] cursor-pointer hover:bg-[#F2ECE1] dark:hover:bg-[#1B1814]">
              <Upload className="w-3.5 h-3.5" /> Upload image
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addImages(e.target.files)} />
            </label>
            <span className="text-xs text-zinc-500">or choose a cover photo:</span>
            {PRESET_IMAGES.map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => set('images', [...values.images, p.url])}
                className="text-xs px-2.5 py-1 border border-[#26211C]/20 dark:border-[#9A7432]/30 hover:border-[#1E4D38] dark:hover:border-[#52B788] cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        {errors.images && <p className="text-xs text-[#1E4D38] dark:text-[#52B788] font-medium">{errors.images}</p>}
      </Section>

      <Section title="Who is this fundraiser for?">
        <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Who is this fundraiser for">
          {BENEFICIARY_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={values.beneficiaryType === o.id}
              onClick={() => set('beneficiaryType', o.id)}
              className={`text-left border px-4 py-3 cursor-pointer transition-colors ${
                values.beneficiaryType === o.id
                  ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#EFE7D5] dark:bg-[#181512]'
                  : 'border-[#26211C]/20 dark:border-[#9A7432]/30 hover:border-[#1E4D38] dark:hover:border-[#52B788]'
              }`}
            >
              <span className="block text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">{o.label}</span>
              <span className="block text-xs text-zinc-500">{o.hint}</span>
            </button>
          ))}
        </div>

        {needsBeneficiary && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              id="field-beneficiary.name"
              label="Beneficiary name"
              value={values.beneficiary.name}
              error={errors['beneficiary.name']}
              onChange={(e) => set('beneficiary', { ...values.beneficiary, name: e.target.value })}
            />
            <Input
              id="field-beneficiary.phone"
              label="Beneficiary phone"
              value={values.beneficiary.phone}
              error={errors['beneficiary.phone']}
              placeholder="0911223344"
              onChange={(e) => set('beneficiary', { ...values.beneficiary, phone: e.target.value })}
            />
            <div className="sm:col-span-2" id="field-beneficiary.info">
              <Label htmlFor="beneficiary-info">About the beneficiary:</Label>
              <textarea
                id="beneficiary-info"
                rows={3}
                value={values.beneficiary.info}
                onChange={(e) => set('beneficiary', { ...values.beneficiary, info: e.target.value })}
                className={fieldClass(!!errors['beneficiary.info'])}
              />
              <FieldError>{errors['beneficiary.info']}</FieldError>
            </div>
          </div>
        )}

        {isCommunity && (
          <Select
            id="field-organizationId"
            label="Community or organization"
            value={values.organizationId}
            error={errors.organizationId}
            onChange={(e) => set('organizationId', e.target.value)}
            options={[
              { value: '', label: 'Choose one' },
              ...orgs.map((o) => ({ value: o.id, label: o.name })),
            ]}
          />
        )}
      </Section>

      {/* Where the money goes: completely hidden and bypassed for Community Beneficiary */}
      {!isCommunity && (
        <Section
          title="Where the money goes"
          hint="Select one or more receiving banks. All selected banks will be clearly displayed for contributors."
        >
          <div id="field-banks" className="space-y-4">
            {selectedBanks.length === 0 ? (
              <div className="space-y-2">
                <Select
                  id="field-bank.bankId"
                  label="Select a primary bank"
                  value=""
                  error={errors['bank.bankId'] || errors.banks}
                  disabled={lockSensitive}
                  onChange={(e) => {
                    if (e.target.value) handleAddBank(e.target.value);
                  }}
                  options={[
                    { value: '', label: 'Choose a bank' },
                    ...banks.map((b) => ({ value: b.id, label: b.name })),
                  ]}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {selectedBanks.map((item, index) => {
                  const bankMeta = banks.find((b) => b.id === item.bankId);
                  const accountNumError =
                    errors[`banks.${index}.accountNumber`] || (index === 0 ? errors['bank.accountNumber'] : undefined);
                  const accountNameError =
                    errors[`banks.${index}.accountName`] || (index === 0 ? errors['bank.accountName'] : undefined);

                  return (
                    <div
                      key={item.bankId || index}
                      className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#26211C]/10 dark:border-[#9A7432]/20">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
                          <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6]">
                            {bankMeta?.name || item.bankId}
                          </span>
                        </div>
                        {selectedBanks.length > 1 && !lockSensitive && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBank(index)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1 font-mono"
                          >
                            <Trash2 className="w-3 h-3" /> Remove bank
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          id={`field-banks-${index}-accountNumber`}
                          label="Account number"
                          inputMode="numeric"
                          value={item.accountNumber}
                          error={accountNumError}
                          disabled={lockSensitive}
                          placeholder="e.g. 1000284920194"
                          onChange={(e) => handleUpdateBank(index, { accountNumber: e.target.value })}
                        />
                        <Input
                          id={`field-banks-${index}-accountName`}
                          label="Account holder name"
                          value={item.accountName}
                          error={accountNameError}
                          disabled={lockSensitive}
                          placeholder="Full name as registered on account"
                          onChange={(e) => handleUpdateBank(index, { accountName: e.target.value })}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Option to add more banks */}
                {availableUnselectedBanks.length > 0 && !lockSensitive && (
                  <div className="pt-2">
                    <Select
                      id="field-add-bank"
                      label="Add another receiving bank"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleAddBank(e.target.value);
                      }}
                      options={[
                        { value: '', label: '+ Select additional bank to add...' },
                        ...availableUnselectedBanks.map((b) => ({ value: b.id, label: b.name })),
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
            {errors.banks && <p className="text-xs text-[#1E4D38] dark:text-[#52B788] font-medium">{errors.banks}</p>}
            {lockSensitive && <p className="text-xs text-zinc-500">Bank details cannot change after approval.</p>}
          </div>
        </Section>
      )}

      <Section
        title="Verification documents"
        hint={`Optional: upload up to ${MAX_DOCUMENTS} supporting documents (official letter, medical evidence, or identification).`}
      >
        <div id="field-documents" className="flex flex-wrap items-end gap-3">
          <div className="w-52">
            <Select
              label="Document type"
              value={docKind}
              onChange={(e) => setDocKind(e.target.value as DocumentKind)}
              options={DOC_KINDS}
            />
          </div>
          {values.documents.length < MAX_DOCUMENTS ? (
            <label className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-wider px-3 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#12100E] cursor-pointer hover:bg-[#F2ECE1] dark:hover:bg-[#1B1814]">
              <Upload className="w-3.5 h-3.5" /> Choose file
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  addDocument(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          ) : (
            <span className="font-mono text-xs text-zinc-500 py-2">Maximum {MAX_DOCUMENTS} documents reached</span>
          )}
        </div>

        {values.documents.length > 0 && (
          <ul className="space-y-1.5">
            {values.documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between text-sm border border-[#26211C]/20 dark:border-[#9A7432]/30 px-3 py-1.5"
              >
                <span className="truncate">
                  {d.fileName}{' '}
                  <span className="text-xs text-zinc-500">
                    · {DOC_KINDS.find((k) => k.value === d.kind)?.label} · {d.sizeKb} KB
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${d.fileName}`}
                  className="cursor-pointer p-1"
                  onClick={() => set('documents', values.documents.filter((x) => x.id !== d.id))}
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.documents && <p className="text-xs text-[#1E4D38] dark:text-[#52B788] font-medium">{errors.documents}</p>}
      </Section>

      {notice && <p role="alert" className="text-sm text-[#1E4D38] dark:text-[#52B788] font-medium">{notice}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} disabled={busy}>
          Back
        </Button>
        <div className="flex gap-3">
          {onSaveDraft && (
            <Button
              variant="secondary"
              isLoading={busy}
              onClick={() => run('draft', onSaveDraft)}
              icon={<Save className="w-4 h-4" />}
            >
              Save draft
            </Button>
          )}
          <Button
            variant="primary"
            isLoading={busy}
            onClick={() => run('submit', onContinue)}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
