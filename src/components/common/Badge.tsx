import React from 'react';
import { ItemStatus, BorrowStatus, UserRole } from '../../types/inventory';

export const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const styles: Record<ItemStatus, string> = {
    'In Stock': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Low Stock': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Out of Stock': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'Maintenance': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const dots: Record<ItemStatus, string> = {
    'In Stock': 'bg-emerald-400',
    'Low Stock': 'bg-amber-400',
    'Out of Stock': 'bg-rose-400',
    'Maintenance': 'bg-purple-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
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
    New: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Good: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Fair: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'Needs Maintenance': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Damaged: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[condition] || styles['Good']
      }`}
    >
      {condition}
    </span>
  );
};

export const BorrowStatusBadge: React.FC<{ status: BorrowStatus }> = ({ status }) => {
  const styles: Record<BorrowStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    returned: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    overdue: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles['pending']
      }`}
    >
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    lead: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    member: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  };

  return (
    <span
      className={`inline-flex items-center uppercase tracking-wider px-2 py-0.5 rounded text-[10px] font-semibold border ${
        styles[role] || styles['member']
      }`}
    >
      {role}
    </span>
  );
};

