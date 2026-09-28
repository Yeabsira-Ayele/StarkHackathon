import { AuditLog, AdminStats } from '../types/admin.types';

export const INITIAL_ADMIN_STATS: AdminStats = {
  pendingCount: 2,
  approvedCount: 14,
  rejectedCount: 1,
  totalVolumeETB: 3450000,
  activeFoundations: 8,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    action: 'approve',
    targetId: 'camp-bethlehem-cardiac',
    targetTitle: 'የህጻን ቤተልሔም አስቸኳይ የልብ ቀዶ-ጥገና ህክምና ድጋፍ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'የህክምና ቦርድ እና የሲቪል ማኅበራት ፈቃድ ተረጋግጧል',
    timestamp: '2024-03-01T10:00:00Z',
  },
  {
    id: 'audit-02',
    action: 'approve',
    targetId: 'camp-oromia-school-stem',
    targetTitle: 'ለኦሮሚያ ገጠር ትምህርት ቤቶች የኮምፒውተር ቤተ-ሙከራ ማደራጃ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'ከትምህርት ቢሮ የተሰጠ የትብብር ደብዳቤ ትክክለኛ ነው',
    timestamp: '2024-03-05T14:30:00Z',
  },
  {
    id: 'audit-03',
    action: 'reject',
    targetId: 'camp-unverified-09',
    targetTitle: 'የግል የንግድ እንቅስቃሴ ማስፋፊያ የህዝብ ፈንድ ጥያቄ',
    adminEmail: 'oversight@acso.gov.et',
    reason: 'በሲቪል ማኅበራት ህግ መሰረት ለግል ትርፍ የህዝብ ልገሳ መሰብሰብ አይፈቀድም',
    timestamp: '2024-03-10T09:15:00Z',
  },
];
