import React, { useState } from 'react';
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

const PERM_LABEL: Record<AdminPermission, string> = {
  fundraisers: 'Fundraisers', reports: 'Reports', donations: 'Donations', users: 'Users', organizations: 'Organizations', admins: 'Admins',
};

export const AdminAdmins: React.FC = () => {
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
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || 'Action failed', 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title="Admins" subtitle="View admins, add new ones, and manage access and roles." actions={<AdminButton tone="red" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>Add admin</AdminButton>} />

      <DataTable head={['Admin', 'Role', 'Access', 'Last active', 'Status', '']}>
        {s.admins.map((a) => (
          <Tr key={a.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={a.name} src={a.photo} size="sm" />
                <div><div className="text-sm font-semibold">{a.name}{isMe(a) && <span className="ml-2 font-mono text-[10px] text-[#8B2626]">(you)</span>}</div><div className="font-mono text-[10px] text-zinc-500">{a.email}</div></div>
              </div>
            </Td>
            <Td className="font-mono text-xs">{ADMIN_ROLE_LABELS[a.role]}</Td>
            <Td className="font-mono text-[11px] max-w-[220px]">{a.permissions.length === ADMIN_ALL_PERMISSIONS.length ? 'Full access' : a.permissions.map((p) => PERM_LABEL[p]).join(', ') || 'None'}</Td>
            <Td className="font-mono text-xs whitespace-nowrap">{fmtDateTime(a.lastActive)}</Td>
            <Td><StatusBadge status={a.status} /></Td>
            <Td className="text-right"><AdminButton onClick={() => setOpenId(a.id)}>Manage</AdminButton></Td>
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
            onClick={() => save(async () => { await store.actions.updateAdmin(open.id, { status: open.status === 'active' ? 'disabled' : 'active' }, `Admin {name} ${open.status === 'active' ? 'disabled' : 're-enabled'}`); }, open.status === 'active' ? 'Admin disabled.' : 'Admin re-enabled.')}
          >
            {open.status === 'active' ? 'Disable admin' : 'Re-enable admin'}
          </AdminButton>
        )}
      >
        {open && (
          <>
            <Panel title="Role">
              <label className={labelCls}>Role</label>
              <select
                className={inputCls}
                value={open.role}
                disabled={isMe(open) || busy}
                onChange={(e) => {
                  const role = e.target.value as AdminRoleName;
                  save(async () => { await store.actions.updateAdmin(open.id, { role, permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS[role] }, `Role for {name} changed to ${ADMIN_ROLE_LABELS[role]}`); }, 'Role updated.');
                }}
              >
                {(Object.keys(ADMIN_ROLE_LABELS) as AdminRoleName[]).map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
              </select>
              {isMe(open) && <p className="font-mono text-[10px] text-zinc-500 mt-2">You cannot change your own role or access.</p>}
            </Panel>
            <Panel title="Access">
              <div className="grid sm:grid-cols-2 gap-2">
                {ADMIN_ALL_PERMISSIONS.map((p) => {
                  const on = open.permissions.includes(p);
                  return (
                    <label key={p} className={`flex items-center gap-2 p-2.5 border font-mono text-xs ${on ? 'border-[#8B2626]/60' : 'border-[#26211C]/20'} ${isMe(open) ? 'opacity-60' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={isMe(open) || busy}
                        onChange={() => save(async () => { await store.actions.updateAdmin(open.id, { permissions: on ? open.permissions.filter((x) => x !== p) : [...open.permissions, p] }, `Access to ${PERM_LABEL[p]} ${on ? 'removed from' : 'granted to'} {name}`); }, 'Access updated.')}
                      />
                      {PERM_LABEL[p]}
                    </label>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Admin activity" flush actions={<Activity className="w-4 h-4 text-[#9A7432]" />}>
              <ActivityList events={s.activity.filter((e) => e.actorIsAdmin && e.actor === open.name)} />
            </Panel>
          </>
        )}
      </DetailDrawer>

      <Modal
        isOpen={adding}
        onClose={() => setAdding(false)}
        title="Add admin"
        subtitle="The new admin is notified by email."
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <AdminButton onClick={() => setAdding(false)}>Cancel</AdminButton>
            <AdminButton tone="red" busy={busy} disabled={!valid} onClick={() => save(async () => {
              await store.actions.addAdmin({ name: form.name.trim(), email: form.email.trim(), role: form.role, permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS[form.role] });
              setAdding(false); setForm({ name: '', email: '', role: 'moderator' });
            }, 'Admin added.')}>Add admin</AdminButton>
          </div>
        }
      >
        <div className="space-y-3">
          <div><label className={labelCls}>Full name</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {form.email && !valid && <p className="font-mono text-[10px] text-[#8B2626] mt-1">Enter a valid email that is not already an admin.</p>}</div>
          <div><label className={labelCls}>Role</label>
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRoleName })}>
              {(Object.keys(ADMIN_ROLE_LABELS) as AdminRoleName[]).map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
            </select></div>
        </div>
      </Modal>
    </div>
  );
};
