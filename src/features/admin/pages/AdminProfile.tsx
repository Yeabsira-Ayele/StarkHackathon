import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, LogOut, Save } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar.tsx';
import { useAdmin } from '../hooks/AdminContext.ts';
import { ADMIN_ROLE_LABELS } from '../data/admin.data.ts';
import { AdminButton, AdminErrorState, Panel, SectionHeader, inputCls, labelCls, useAdminToast } from '../components/AdminUI.tsx';

export const AdminProfile: React.FC = () => {
  const { t } = useTranslation();
  const { store, onExit } = useAdmin();
  const { notify } = useAdminToast();
  const snapshot = store.snapshot!;
  const me = snapshot.admins.find((a) => a.id === snapshot.currentAdminId);
  const [name, setName] = useState(me?.name || '');
  const [email, setEmail] = useState(me?.email || '');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (snapshot.unavailableSections?.includes('profile') || !me) {
    return <div className="max-w-3xl"><SectionHeader title={t('adminProfile.title')} subtitle={t('adminProfile.subtitle')} /><AdminErrorState title="Admin profile is unavailable" text="The admin backend does not currently provide profile records or profile management." onRetry={() => void store.actions.refresh()} /></div>;
  }

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  const profileDirty = name.trim() !== me.name || email.trim() !== me.email;
  const pwErr =
    pw.next && pw.next.length < 8 ? t('adminProfile.passwordTooShort')
    : pw.confirm && pw.next !== pw.confirm ? t('adminProfile.passwordMismatch') : '';

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || t('adminUi.actionFailed'), 'err'); } finally { setBusy(false); }
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return notify(t('adminProfile.imageOnly'), 'err');
    if (f.size > 1_500_000) return notify(t('adminProfile.imageTooLarge'), 'err');
    const reader = new FileReader();
    reader.onload = () => run(async () => { await store.actions.updateAdmin(me.id, { photo: String(reader.result) }, 'Admin {name} changed profile photo'); }, t('adminProfile.photoUpdated'));
    reader.readAsDataURL(f);
  };

  return (
    <div className="max-w-3xl">
      <SectionHeader title={t('adminProfile.title')} subtitle={t('adminProfile.subtitle')} />
      <div className="space-y-6">
        <Panel title={t('adminProfile.profile')}>
          <div className="flex items-center gap-5 mb-5">
            <Avatar name={me.name} src={me.photo} size="xl" />
            <div>
              <p className="font-serif font-black text-xl">{me.name}</p>
              <p className="font-mono text-[11px] text-zinc-500">{ADMIN_ROLE_LABELS[me.role]}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              <AdminButton className="mt-2" icon={<Camera className="w-3.5 h-3.5" />} onClick={() => fileRef.current?.click()}>{t('adminProfile.changePhoto')}</AdminButton>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>{t('adminProfile.name')}</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className={labelCls}>{t('adminProfile.email')}</label><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              {email && !emailOk && <p className="font-mono text-[10px] text-[#8B2626] mt-1">{t('adminProfile.invalidEmail')}</p>}</div>
          </div>
          <div className="flex justify-end mt-4">
            <AdminButton tone="red" busy={busy} disabled={!profileDirty || !name.trim() || !emailOk} icon={<Save className="w-3.5 h-3.5" />}
              onClick={() => run(async () => { await store.actions.updateAdmin(me.id, { name: name.trim(), email: email.trim() }, 'Admin profile updated: {name}'); }, t('adminProfile.profileSaved'))}>{t('adminProfile.saveProfile')}</AdminButton>
          </div>
        </Panel>

        <Panel title={t('adminProfile.changePassword')}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>{t('adminProfile.currentPassword')}</label><input type="password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
            <div><label className={labelCls}>{t('adminProfile.newPassword')}</label><input type="password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
            <div><label className={labelCls}>{t('adminProfile.confirmPassword')}</label><input type="password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
          </div>
          {pwErr && <p className="font-mono text-[10px] text-[#8B2626] mt-2">{pwErr}</p>}
          <div className="flex justify-end mt-4">
            <AdminButton tone="red" busy={busy} disabled={!pw.current || pw.next.length < 8 || pw.next !== pw.confirm}
              onClick={() => run(async () => { await store.actions.updateAdmin(me.id, {}, 'Admin {name} changed password'); setPw({ current: '', next: '', confirm: '' }); }, t('adminProfile.passwordUpdated'))}>{t('adminProfile.updatePassword')}</AdminButton>
          </div>
        </Panel>

        <Panel title={t('adminProfile.session')}>
          <AdminButton tone="dark" icon={<LogOut className="w-3.5 h-3.5" />} onClick={onExit}>{t('adminProfile.signOut')}</AdminButton>
        </Panel>
      </div>
    </div>
  );
};
