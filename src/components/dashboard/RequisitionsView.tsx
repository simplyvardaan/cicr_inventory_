import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Inbox,
  Boxes,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  User,
  Calendar,
  Ticket,
} from 'lucide-react';
import { BorrowRequest, InventoryItem } from '../../types/inventory';

interface RequisitionsViewProps {
  requests: BorrowRequest[];
  items: InventoryItem[];
  isLeadOrAdmin: boolean;
  userEmail?: string;
  userId?: string;
  onNavigateToVault: () => void;
  onBorrowAction: (requestId: string, action: 'approved' | 'rejected' | 'returned', note?: string) => void;
  onOpenIssuePass: (req: BorrowRequest) => void;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requests,
  items,
  isLeadOrAdmin,
  userEmail,
  userId,
  onNavigateToVault,
  onBorrowAction,
  onOpenIssuePass,
}) => {
  const [requestStatusTab, setRequestStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'returned'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const activeRequestsList = isLeadOrAdmin
    ? requests
    : requests.filter(
        (r) =>
          r.user_email === userEmail ||
          r.user_id === userId ||
          (userEmail && r.user_email?.toLowerCase() === userEmail.toLowerCase())
      );

  const pendingCount = activeRequestsList.filter((r) => r.status === 'pending').length;
  const approvedCount = activeRequestsList.filter((r) => r.status === 'approved').length;
  const rejectedCount = activeRequestsList.filter((r) => r.status === 'rejected').length;
  const returnedCount = activeRequestsList.filter((r) => r.status === 'returned').length;

  const filteredList = activeRequestsList.filter((req) => {
    const matchesTab = requestStatusTab === 'all' || req.status === requestStatusTab;
    const q = requestSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.item_name.toLowerCase().includes(q) ||
      req.project_name.toLowerCase().includes(q) ||
      req.user_name.toLowerCase().includes(q) ||
      req.user_email.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Bell className="w-5 h-5 text-blue-600 dark:text-purple-400" />
            {isLeadOrAdmin
              ? 'Requisition Approval Portal (Admin Clearance)'
              : 'My Hardware Requisitions & Issues'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            {isLeadOrAdmin
              ? 'Authorize member hardware requisitions. Hardware can only be issued and collected after administrator approval.'
              : 'Track requisition status. Components must be approved by an administrator before they can be issued.'}
          </p>
        </div>

        {!isLeadOrAdmin && (
          <button
            type="button"
            onClick={onNavigateToVault}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-md shadow-blue-600/25 dark:shadow-purple-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Borrow Hardware</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All', count: activeRequestsList.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount },
              { key: 'returned', label: 'Returned', count: returnedCount },
            ].map((tab) => {
              const isTabActive = requestStatusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRequestStatusTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isTabActive
                      ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-[#151520] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isTabActive
                        ? 'bg-white text-blue-600 dark:text-purple-400'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Requests List */}
        {filteredList.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-50 dark:bg-[#121219] border-2 border-slate-200 dark:border-zinc-800/70 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-purple-950/40 border-2 border-blue-200 dark:border-purple-500/30 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {requestStatusTab === 'all'
                ? 'No borrow requests found'
                : `No ${requestStatusTab} requests found`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              {!isLeadOrAdmin
                ? 'You currently have no requisitions in this tab. Explore our component vault to check out electronics.'
                : 'No requisitions currently match this filter criteria.'}
            </p>
            {!isLeadOrAdmin && (
              <button
                type="button"
                onClick={onNavigateToVault}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/25 dark:shadow-purple-950/40"
              >
                <Boxes className="w-4 h-4" />
                <span>Browse Component Vault</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
            {filteredList.map((req) => {
              const matchedItem = items.find((i) => i.id === req.item_id);
              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-purple-500 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs shadow-sm"
                >
                  {/* Info Column */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                        {req.item_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-purple-950/60 border border-blue-200 dark:border-purple-500/40 text-blue-700 dark:text-purple-300 font-mono text-[11px] font-bold">
                        x{req.quantity}
                      </span>
                      <span
                        className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                          req.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : req.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : req.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-400" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-400" />}
                        {req.status === 'returned' && <RotateCcw className="w-3 h-3 text-blue-600 dark:text-purple-400" />}
                        {req.status === 'approved' ? 'Approved / Authorized to Issue' : req.status === 'pending' ? 'Pending Admin Clearance' : req.status}
                      </span>
                    </div>

                    {/* Borrower Info (prominent for Admins) */}
                    {isLeadOrAdmin && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-700 dark:text-zinc-400 text-xs font-medium">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-slate-500 dark:text-zinc-400">Borrower:</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{req.user_name}</strong>
                        </div>
                        <span className="text-slate-600 dark:text-zinc-400 font-mono text-[11px] break-all">
                          ({req.user_email})
                        </span>
                      </div>
                    )}

                    {/* Project & Purpose */}
                    <div className="text-slate-700 dark:text-zinc-300 space-y-1">
                      <div>
                        <span className="text-slate-600 dark:text-zinc-400 font-semibold">Project: </span>
                        <span className="text-blue-600 dark:text-purple-400 font-semibold">{req.project_name}</span>
                        {req.purpose && (
                          <>
                            <span className="text-zinc-600 mx-1.5">|</span>
                            <span className="text-slate-700 dark:text-zinc-300">{req.purpose}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dates Timeline & Storage Location */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-700 dark:text-zinc-300 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span className="text-slate-600 dark:text-zinc-400 font-semibold">Requested: </span>
                        <strong className="text-slate-800 dark:text-zinc-300 font-medium">
                          {req.created_at ? req.created_at.split('T')[0] : 'Recently'}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400/80" />
                        <span className="text-slate-600 dark:text-zinc-400 font-semibold">Expected Return: </span>
                        <strong className="text-amber-700 dark:text-amber-300 font-bold">{req.expected_return_date}</strong>
                      </span>
                      {matchedItem?.location && (
                        <span className="text-slate-700 dark:text-zinc-300 font-mono break-words">
                          <span className="text-slate-600 dark:text-zinc-400 font-semibold">Lab Location: </span><strong className="text-slate-900 dark:text-zinc-200 font-bold">{matchedItem.location}</strong>
                        </span>
                      )}
                      {req.actual_return_date && (
                        <span className="text-blue-600 dark:text-purple-400 font-semibold">
                          Returned: {req.actual_return_date}
                        </span>
                      )}
                    </div>

                    {/* Admin Note / Instructions */}
                    {req.admin_notes && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-[#1b1b26] border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                        <span className="font-bold text-slate-900 dark:text-white">Admin Note: </span>
                        {req.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Action Column for Both Admins & Members */}
                  <div className="flex flex-col sm:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-zinc-800">
                    {isLeadOrAdmin ? (
                      <>
                        {req.status === 'pending' && (
                          <div className="space-y-2 w-full sm:w-auto">
                            <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting Admin Approval to Issue</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onBorrowAction(req.id, 'approved')}
                                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md transition-colors flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve &amp; Authorize Issue</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onBorrowAction(req.id, 'rejected')}
                                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md transition-colors flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {req.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => onBorrowAction(req.id, 'returned')}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/25 dark:shadow-purple-950/40 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                            <span>Mark Returned &amp; Restock</span>
                          </button>
                        )}
                      </>
                    ) : (
                      /* Regular Member Clearance Actions */
                      <div className="flex flex-col sm:items-end gap-1.5">
                        {req.status === 'pending' && (
                          <div className="flex flex-col sm:items-end gap-1">
                            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Pending Admin Clearance</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 text-right max-w-xs">
                              Cannot issue yet. Sent to Admin Portal for clearance.
                            </span>
                          </div>
                        )}

                        {req.status === 'approved' && (
                          <div className="flex flex-col sm:items-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenIssuePass(req)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-950/40 transition-colors flex items-center gap-2"
                            >
                              <Ticket className="w-4 h-4 text-white" />
                              <span>Issue &amp; Collect Hardware</span>
                            </button>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold text-right">
                              Approved by {req.approved_by || 'Admin'}
                            </span>
                          </div>
                        )}

                        {req.status === 'rejected' && (
                          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Requisition Rejected</span>
                          </div>
                        )}

                        {req.status === 'returned' && (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                            <span>Returned &amp; Restocked</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
