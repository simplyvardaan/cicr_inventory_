import React from 'react';
import { ItemStatus, BorrowStatus, UserRole } from '../../types/inventory';

export const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const styles: Record<ItemStatus, string> = {
    'In Stock': 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    'Low Stock': 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'Out of Stock': 'bg-red-50 text-red-700 border-2 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    'Maintenance': 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const dots: Record<ItemStatus, string> = {
    'In Stock': 'bg-blue-600',
    'Low Stock': 'bg-amber-500',
    'Out of Stock': 'bg-red-600',
    'Maintenance': 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        styles[status] || styles['In Stock']
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots['In Stock']}`} />
      {status}
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition?: string }> = ({ condition }) => {
  if (!condition) return null;
  const styles: Record<string, string> = {
    New: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    Good: 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Fair: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'Needs Maintenance': 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    Damaged: 'bg-red-50 text-red-700 border-2 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
        styles[condition] || styles['Good']
      }`}
    >
      {condition}
    </span>
  );
};

export const BorrowStatusBadge: React.FC<{ status: BorrowStatus; adminNotes?: string | null }> = ({
  status,
  adminNotes,
}) => {
  const isReturnPending = status === 'approved' && Boolean(adminNotes && adminNotes.includes('[RETURN_REQUESTED]'));

  if (isReturnPending) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Return Clearance Pending
      </span>
    );
  }
  const styles: Record<BorrowStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse',
    approved: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    rejected: 'bg-red-50 text-red-700 border-2 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    returned: 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    overdue: 'bg-red-50 text-red-700 border-2 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };

  return (
    <span
      className={`inline-flex items-center capitalize px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        styles[status] || styles['pending']
      }`}
    >
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-red-50 text-red-700 border-2 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    lead: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    member: 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center uppercase tracking-wider px-2 py-0.5 rounded text-[10px] font-black border ${
        styles[role] || styles['member']
      }`}
    >
      {role}
    </span>
  );
};
