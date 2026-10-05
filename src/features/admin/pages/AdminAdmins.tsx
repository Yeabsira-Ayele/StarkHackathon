import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Plus, ShieldOff, ShieldCheck } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Avatar } from '../../../components/ui/Avatar.tsx';
import { useAdmin } from '../hooks/AdminContext.ts';
import { AdminAccount, AdminPermission, AdminRoleName } from '../types/admin.types.ts';
import { ADMIN_ALL_PERMISSIONS, ADMIN_ROLE_DEFAULT_PERMISSIONS, ADMIN_ROLE_LABELS } from '../data/admin.data.ts';
import {
  AdminButton, DataTable, DetailDrawer, Panel, SectionHeader, StatusBadge, Td, Tr, fmtDateTime, inputCls, labelCls, useAdminToast,
} from '../components/AdminUI.tsx';
import { ActivityList } from './AdminActivity.tsx';

const PERM_KEY: Record<AdminPermission, string> = {
  fundraisers: 'adminUi.fundraisers', reports: 'adminUi.reports', donations: 'adminUi.donations',
  users: 'adminUi.users', organizations: 'adminUi.organizations', admins: 'adminAdmins.admins',
};

export const AdminAdmins: React.FC = () => {
  const { t } = useTranslation();
  const { store } = useAdmin();
  const { notify } = useAdminToast();
  const s = store.snapshot!;
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'moderator' as AdminRoleName });
  const [busy, setBusy] = useState(false);

  const open = s.admins.find((a) => a.id === openId) || null;
  const isMe = (a: AdminAccount) => a.id === s.currentAdminId;
  const valid = form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && !s.admins.some((a) => a.email.toLowerCase() === form.email.toLowerCase());

  const save = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || t('adminUi.actionFailed'), 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title={t('adminAdmins.title')} subtitle={t('adminAdmins.description')} actions={<AdminButton tone="red" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>{t('adminAdmins.add')}</AdminButton>} />

      <DataTable head={[t('adminAdmins.admin'), t('adminAdmins.role'), t('adminAdmins.access'), t('adminAdmins.lastActive'), t('adminUi.statusLabel'), '']}>
        {s.admins.map((a) => (
          <Tr key={a.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={a.name} src={a.photo} size="sm" />
                <div><div className="text-sm font-semibold">{a.name}{isMe(a) && <span className="ml-2 font-mono text-[10px] text-[#8B2626]">({t('adminAdmins.you')})</span>}</div><div className="font-mono text-[10px] text-zinc-500">{a.email}</div></div>
              </div>
            </Td>
            <Td className="font-mono text-xs">{ADMIN_ROLE_LABELS[a.role]}</Td>
            <Td className="font-mono text-[11px] max-w-[220px]">{a.permissions.length === ADMIN_ALL_PERMISSIONS.length ? t('adminAdmins.fullAccess') : a.permissions.map((p) => t(PERM_KEY[p])).join(', ') || t('adminAdmins.none')}</Td>
            <Td className="font-mono text-xs whitespace-nowrap">{fmtDateTime(a.lastActive)}</Td>
            <Td><StatusBadge status={a.status} /></Td>
            <Td className="text-right"><AdminButton onClick={() => setOpenId(a.id)}>{t('adminAdmins.manage')}</AdminButton></Td>
          </Tr>
        ))}
      </DataTable>

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name || ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} /><span className="font-mono text-[10px] text-zinc-500">{open.email}</span></div>}
        footer={open && !isMe(open) && (
          <AdminButton
            tone={open.status === 'active' ? 'red' : 'gold'}
            busy={busy}
            icon={open.status === 'active' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            onClick={() => save(async () => { await store.actions.updateAdmin(open.id, { status: open.status === 'active' ? 'disabled' : 'active' }, `Admin {name} ${open.status === 'active' ? 'disabled' : 're-enabled'}`); }, t(open.status === 'active' ? 'adminAdmins.disabled' : 'adminAdmins.enabled'))}
          >
            {t(open.status === 'active' ? 'adminAdmins.disable' : 'adminAdmins.reEnable')}
          </AdminButton>
        )}
      >
        {open && (
          <>
            <Panel title={t('adminAdmins.role')}>
              <label className={labelCls}>{t('adminAdmins.role')}</label>
              <select
                className={inputCls}
                value={open.role}
                disabled={isMe(open) || busy}
                onChange={(e) => {
                  const role = e.target.value as AdminRoleName;
                  save(async () => { await store.actions.updateAdmin(open.id, { role, permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS[role] }, `Role for {name} changed to ${ADMIN_ROLE_LABELS[role]}`); }, t('adminAdmins.roleUpdated'));
                }}
              >
                {(Object.keys(ADMIN_ROLE_LABELS) as AdminRoleName[]).map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
              </select>
              {isMe(open) && <p className="font-mono text-[10px] text-zinc-500 mt-2">{t('adminAdmins.cannotChangeSelf')}</p>}
            </Panel>
            <Panel title={t('adminAdmins.access')}>
              <div className="grid sm:grid-cols-2 gap-2">
                {ADMIN_ALL_PERMISSIONS.map((p) => {
                  const on = open.permissions.includes(p);
                  return (
                    <label key={p} className={`flex items-center gap-2 p-2.5 border font-mono text-xs ${on ? 'border-[#8B2626]/60' : 'border-[#26211C]/20'} ${isMe(open) ? 'opacity-60' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={isMe(open) || busy}
                        onChange={() => save(async () => { await store.actions.updateAdmin(open.id, { permissions: on ? open.permissions.filter((x) => x !== p) : [...open.permissions, p] }, `Access to ${p} ${on ? 'removed from' : 'granted to'} {name}`); }, t('adminAdmins.accessUpdated'))}
                      />
                      {t(PERM_KEY[p])}
                    </label>
                  );
                })}
              </div>
            </Panel>
            <Panel title={t('adminAdmins.activity')} flush actions={<Activity className="w-4 h-4 text-[#9A7432]" />}>
              <ActivityList events={s.activity.filter((e) => e.actorIsAdmin && e.actor === open.name)} />
            </Panel>
          </>
        )}
      </DetailDrawer>

      <Modal
        isOpen={adding}
        onClose={() => setAdding(false)}
        title={t('adminAdmins.add')}
        subtitle={t('adminAdmins.addNotice')}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <AdminButton onClick={() => setAdding(false)}>{t('adminUi.cancel')}</AdminButton>
            <AdminButton tone="red" busy={busy} disabled={!valid} onClick={() => save(async () => {
              await store.actions.addAdmin({ name: form.name.trim(), email: form.email.trim(), role: form.role, permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS[form.role] });
              setAdding(false); setForm({ name: '', email: '', role: 'moderator' });
            }, t('adminAdmins.added'))}>{t('adminAdmins.add')}</AdminButton>
          </div>
        }
      >
        <div className="space-y-3">
          <div><label className={labelCls}>{t('adminAdmins.fullName')}</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className={labelCls}>{t('adminProfile.email')}</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {form.email && !valid && <p className="font-mono text-[10px] text-[#8B2626] mt-1">{t('adminAdmins.invalidEmail')}</p>}</div>
          <div><label className={labelCls}>{t('adminAdmins.role')}</label>
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRoleName })}>
              {(Object.keys(ADMIN_ROLE_LABELS) as AdminRoleName[]).map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
            </select></div>
        </div>
      </Modal>
    </div>
  );
};
