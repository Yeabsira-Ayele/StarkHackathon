import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Avatar } from '../../../components/ui/Avatar.tsx';
import { useAdmin } from '../hooks/AdminContext.ts';
import { AdminAccount } from '../types/admin.types.ts';
import { ADMIN_ROLE_LABELS } from '../data/admin.data.ts';
import {
  AdminButton, AdminErrorState, DataTable, Panel, SectionHeader, Td, Tr, inputCls, labelCls, useAdminToast,
} from '../components/AdminUI.tsx';

export const AdminAdmins: React.FC = () => {
  const { t } = useTranslation();
  const { store } = useAdmin();
  const { notify } = useAdminToast();
  const snapshot = store.snapshot!;
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AdminAccount | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [busy, setBusy] = useState(false);

  if (!snapshot.isSuperAdmin || snapshot.unavailableSections?.includes('admins')) {
    return (
      <div>
        <SectionHeader title={t('adminAdmins.title')} subtitle={t('adminAdmins.description')} />
        <AdminErrorState
          title={t('adminAdmins.accessDenied')}
          text={t('adminAdmins.accessDeniedDescription')}
          onRetry={() => void store.actions.refresh()}
        />
      </div>
    );
  }

  const save = async (fn: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    try {
      await fn();
      notify(successMessage);
    } catch (error) {
      notify(error instanceof Error ? error.message : t('adminUi.actionFailed'), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title={t('adminAdmins.title')}
        subtitle={t('adminAdmins.description')}
        actions={
          <AdminButton tone="red" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
            {t('adminAdmins.add')}
          </AdminButton>
        }
      />

      {snapshot.admins.length === 0 ? (
        <Panel><p className="text-sm text-zinc-600 dark:text-zinc-400">{t('adminAdmins.empty')}</p></Panel>
      ) : (
        <DataTable head={[t('adminAdmins.admin'), t('adminProfile.email'), t('adminProfile.phone'), t('adminAdmins.role'), '']}>
          {snapshot.admins.map((admin) => (
            <Tr key={admin.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={admin.name} src={admin.photo} size="sm" />
                  <span className="text-sm font-semibold">{admin.name}</span>
                </div>
              </Td>
              <Td className="font-mono text-xs">{admin.email || '—'}</Td>
              <Td className="font-mono text-xs">{admin.phone || '—'}</Td>
              <Td className="font-mono text-xs">{ADMIN_ROLE_LABELS[admin.role]}</Td>
              <Td className="text-right">
                {admin.role === 'admin' && (
                  <AdminButton
                    tone="red"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setRemoving(admin)}
                  >
                    {t('adminAdmins.remove')}
                  </AdminButton>
                )}
              </Td>
            </Tr>
          ))}
        </DataTable>
      )}

      <Modal
        isOpen={adding}
        onClose={() => { setAdding(false); setSelectedUserId(''); }}
        title={t('adminAdmins.add')}
        subtitle={t('adminAdmins.addNotice')}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <AdminButton onClick={() => { setAdding(false); setSelectedUserId(''); }}>{t('adminUi.cancel')}</AdminButton>
            <AdminButton
              tone="red"
              busy={busy}
              disabled={!selectedUserId}
              onClick={() => save(async () => {
                await store.actions.addAdmin(selectedUserId);
                setAdding(false);
                setSelectedUserId('');
              }, t('adminAdmins.added'))}
            >
              {t('adminAdmins.add')}
            </AdminButton>
          </div>
        }
      >
        <div>
          <label className={labelCls} htmlFor="admin-user-select">{t('adminAdmins.selectUser')}</label>
          <select
            id="admin-user-select"
            className={inputCls}
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            <option value="">{t('adminAdmins.selectUserPlaceholder')}</option>
            {snapshot.adminCandidates.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}{user.email ? ` · ${user.email}` : user.phone ? ` · ${user.phone}` : ''}
              </option>
            ))}
          </select>
          {snapshot.adminCandidates.length === 0 && (
            <p className="mt-2 text-xs text-zinc-500">{t('adminAdmins.noCandidates')}</p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        title={t('adminAdmins.remove')}
        subtitle={t('adminAdmins.removeConfirmation', { name: removing?.name ?? '' })}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <AdminButton onClick={() => setRemoving(null)}>{t('adminUi.cancel')}</AdminButton>
            <AdminButton
              tone="red"
              busy={busy}
              onClick={() => removing && save(async () => {
                await store.actions.removeAdmin(removing.id);
                setRemoving(null);
              }, t('adminAdmins.removed'))}
            >
              {t('adminAdmins.remove')}
            </AdminButton>
          </div>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t('adminAdmins.removeConfirmation', { name: removing?.name ?? '' })}
        </p>
      </Modal>
    </div>
  );
};
