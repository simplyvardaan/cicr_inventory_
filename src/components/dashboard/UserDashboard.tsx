import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { BottomNavbar, ActiveView } from '../layout/BottomNavbar';
import { RequestCartModal, CartItem } from '../inventory/RequestCartModal';
import { ChangePasswordModal } from '../profile/ChangePasswordModal';
import { AddEditItemModal } from '../inventory/AddEditItemModal';
import { ItemDetailModal } from '../inventory/ItemDetailModal';
import { MeetTheDevelopers } from './MeetTheDevelopers';
import { TopNavbar } from './TopNavbar';
import { DashboardOverview } from './DashboardOverview';
import { ComponentVaultView } from './ComponentVaultView';
import { RequisitionsView } from './RequisitionsView';
import { AdminHubView } from './AdminHubView';
import { OperatorProfileView } from './OperatorProfileView';
import { IssuePassModal } from './IssuePassModal';
import { InventoryItem, BorrowRequest, isReturnRequested } from '../../types/inventory';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { useToast } from '../common/Toast';
import { Notification } from '../ui/notification-bell';

const isLowReserveItem = (i: InventoryItem): boolean => {
  if (i.available_qty <= 0) return false;
  if (i.total_qty <= 0) return false;
  return (i.available_qty / i.total_qty) < 0.5;
};

export const UserDashboard: React.FC = () => {
  const {
    user,
    profile,
    isLeadOrAdmin,
    refreshProfile,
    updateProfile,
    approveUserAccount,
    rejectUserAccount,
    updateUserRole,
  } = useAuth();
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
  const { items, requests, logs, deleteItem, updateBorrowStatus, refreshData } = useInventory();
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedIssuePassReq, setSelectedIssuePassReq] = useState<BorrowRequest | null>(null);

  // Filters in Component Vault
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Profile edit fields
  const [editName, setEditName] = useState(profile?.full_name || (user?.user_metadata?.full_name as string) || '');
  const [editEnrollment, setEditEnrollment] = useState(profile?.roll_number || (user?.user_metadata?.enrollment_no as string) || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || (user?.user_metadata?.phone as string) || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(
    (profile?.avatar_url && !profile.avatar_url.startsWith('status:'))
      ? profile.avatar_url
      : ((user?.user_metadata?.avatar_url as string) || '')
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Admin Hub state
  const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Notifications
  // Notifications with persistent read status in localStorage
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('cicr-read-notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleMarkNotificationRead = (id: string) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem('cicr-read-notifications', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = () => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      try {
        localStorage.setItem('cicr-read-notifications', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    handleMarkAllNotificationsRead();
    setNotifications([]);
  };

  const handleDismissNotification = (id: string) => {
    handleMarkNotificationRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Update profile edit state when profile changes
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditEnrollment(profile.roll_number || '');
      setEditPhone(profile.phone || '');
      if (profile.avatar_url && !profile.avatar_url.startsWith('status:')) {
        setEditAvatarUrl(profile.avatar_url);
      }
    }
  }, [profile]);

  // Fetch pending registrations and all members
  const fetchPendingAccounts = async () => {
    try {
      const { data: profData } = await supabase
        .from('profiles')
        .select('*');

      // Resolved accounts: Any account marked approved, rejected, or admin is permanently RESOLVED!
      const resolvedEmails = new Set(
        (profData || [])
          .filter(
            (p) =>
              p.status === 'approved' ||
              p.status === 'rejected' ||
              p.role === 'admin' ||
              p.avatar_url === 'status:approved' ||
              p.avatar_url === 'status:rejected'
          )
          .map((p) => p.email?.toLowerCase())
      );

      const resolvedUserIds = new Set(
        (profData || [])
          .filter(
            (p) =>
              p.status === 'approved' ||
              p.status === 'rejected' ||
              p.role === 'admin' ||
              p.avatar_url === 'status:approved' ||
              p.avatar_url === 'status:rejected'
          )
          .map((p) => p.id)
      );

      const pendingMap = new Map();

      (profData || []).forEach((p) => {
        const isResolved =
          p.role === 'admin' ||
          p.status === 'approved' ||
          p.status === 'rejected' ||
          p.avatar_url === 'status:approved' ||
          p.avatar_url === 'status:rejected';

        if (!isResolved) {
          const isPending =
            p.status === 'pending' ||
            p.avatar_url === 'status:pending' ||
            !p.status;

          const emailKey = p.email?.toLowerCase();
          if (isPending && emailKey && !resolvedEmails.has(emailKey)) {
            pendingMap.set(emailKey, p);
          }
        }
      });

      try {
        const { data: reqLogs } = await supabaseAdmin
          .from('activity_logs')
          .select('*')
          .eq('action', 'ACCOUNT_REQUEST')
          .order('created_at', { ascending: false });

        (reqLogs || []).forEach((log) => {
          let details: any = {};
          try {
            details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          } catch {
            details = {};
          }
          const email = (details?.email || '').toLowerCase();
          const userId = details?.userId || log.user_id;
          const isPending = !details?.status || details?.status === 'pending';

          // Strictly filter out any account whose email or user_id is already resolved (approved OR rejected)!
          if (
            isPending &&
            email &&
            !resolvedEmails.has(email) &&
            (!userId || !resolvedUserIds.has(userId)) &&
            !pendingMap.has(email)
          ) {
            pendingMap.set(email, {
              id: userId || log.id,
              full_name: details?.fullName || log.user_name || 'New Member',
              email: details?.email,
              roll_number: details?.enrollmentNo || '',
              phone: details?.phone || '',
              role: details?.role || 'member',
              status: 'pending',
              created_at: log.created_at,
            });
          }
        });
      } catch (logErr) {
        console.warn('Notice loading request logs:', logErr);
      }

      setPendingAccounts(Array.from(pendingMap.values()));
    } catch {
      // ignore
    }
  };

  const fetchAllMembers = async () => {
    try {
      setLoadingMembers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      if (!error && data) {
        setAllMembers(data.filter((m) => m.status === 'approved' || m.role === 'admin' || m.avatar_url === 'status:approved'));
      }
    } catch {
      // ignore
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingAccounts();
      fetchAllMembers();
    }
  }, [isAdmin]);

  // Generate notifications: warnings are strictly visible to only admin accounts!
  useEffect(() => {
    const list: Notification[] = [];
    if (isAdmin) {
      const lowItems = items.filter((i) => isLowReserveItem(i));
      lowItems.forEach((it) => {
        const notifId = `low-${it.id}`;
        list.push({
          id: notifId,
          title: `Low Reserve: ${it.name}`,
          message: `Only ${it.available_qty} units left in stock (${it.location}).`,
          type: 'warning',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: readNotifIds.has(notifId),
          action: () => setActiveView('inventory'),
        });
      });
    }

    const pendingReqs = requests.filter((r) => r.status === 'pending');
    if (isLeadOrAdmin && pendingReqs.length > 0) {
      const notifId = 'pending-reqs-alert';
      list.push({
        id: notifId,
        title: `${pendingReqs.length} Requisition(s) Pending`,
        message: 'Members have requested hardware awaiting admin authorization.',
        type: 'info',
        timestamp: 'Real-time',
        read: readNotifIds.has(notifId),
        action: () => setActiveView('review-requests'),
      });
    }

    const returnReqs = requests.filter((r) => isReturnRequested(r));
    if (isLeadOrAdmin && returnReqs.length > 0) {
      const notifId = 'pending-returns-alert';
      list.push({
        id: notifId,
        title: `${returnReqs.length} Return Clearance(s) Pending`,
        message: 'Members have submitted hardware for return awaiting admin check-in.',
        type: 'warning',
        timestamp: 'Real-time',
        read: readNotifIds.has(notifId),
        action: () => setActiveView('review-requests'),
      });
    }

    if (isAdmin && pendingAccounts.length > 0) {
      const notifId = 'pending-accounts-alert';
      list.push({
        id: notifId,
        title: `${pendingAccounts.length} Registration(s) Pending`,
        message: 'New user account requests are awaiting admin verification in Management Hub.',
        type: 'info',
        timestamp: 'Pending Review',
        read: readNotifIds.has(notifId),
        action: () => setActiveView('logs'),
      });
    }

    // Member-specific requisition updates
    if (user?.email) {
      const myApproved = requests.filter(
        (r) => (r.user_email?.toLowerCase() === user.email?.toLowerCase() || r.user_id === user.id) && r.status === 'approved'
      );
      if (myApproved.length > 0) {
        const notifId = 'my-approved-requisitions';
        list.push({
          id: notifId,
          title: `${myApproved.length} Requisition(s) Cleared`,
          message: 'Admin has authorized your hardware pass. Tap to view and collect hardware.',
          type: 'success',
          timestamp: 'Authorized',
          read: readNotifIds.has(notifId),
          action: () => setActiveView('review-requests'),
        });
      }

      const myRejected = requests.filter(
        (r) => (r.user_email?.toLowerCase() === user.email?.toLowerCase() || r.user_id === user.id) && r.status === 'rejected'
      );
      if (myRejected.length > 0) {
        const notifId = 'my-rejected-requisitions';
        list.push({
          id: notifId,
          title: `${myRejected.length} Requisition(s) Declined`,
          message: 'An administrator has reviewed and declined your requisition request.',
          type: 'error',
          timestamp: 'Reviewed',
          read: readNotifIds.has(notifId),
          action: () => setActiveView('review-requests'),
        });
      }

      const myReturnPending = requests.filter(
        (r) => (r.user_email?.toLowerCase() === user.email?.toLowerCase() || r.user_id === user.id) && isReturnRequested(r)
      );
      if (myReturnPending.length > 0) {
        const notifId = 'my-return-pending';
        list.push({
          id: notifId,
          title: `${myReturnPending.length} Return Clearance(s) Pending`,
          message: 'Your hardware return request is submitted and awaiting admin inspection & approval.',
          type: 'info',
          timestamp: 'In Review',
          read: readNotifIds.has(notifId),
          action: () => setActiveView('review-requests'),
        });
      }
    }

    setNotifications(list);
  }, [items, requests, isLeadOrAdmin, isAdmin, user, readNotifIds]);

  // Cart operations
  const handleAddToCart = (item: InventoryItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.available_qty) {
          showToast('warning', 'Max Units Added', `Only ${item.available_qty} items available in vault.`);
          return prev;
        }
        showToast('info', 'Cart Updated', `Increased ${item.name} quantity.`);
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      showToast('success', 'Staged in Cart', `${item.name} staged for requisition dispatch.`);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > c.item.available_qty) {
              showToast('warning', 'Limit Reached', `Only ${c.item.available_qty} units available.`);
              return c;
            }
            return { ...c, quantity: newQty };
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    showToast('info', 'Item Removed', 'Component removed from request cart.');
  };

  // Requisitions & Approvals
  const handleBorrowAction = async (
    requestId: string,
    action: 'approved' | 'rejected' | 'returned',
    note?: string
  ) => {
    const res = await updateBorrowStatus(requestId, action, note);
    if (res.success) {
      showToast('success', `Requisition ${action.toUpperCase()}`, `Borrow status updated to ${action}.`);
      await refreshData();
    } else {
      showToast('error', 'Update Failed', res.error);
    }
  };

  // Member Management
  const handlePromoteRole = async (targetUserId: string, newRole: 'admin' | 'member', name: string) => {
    try {
      if (!isAdmin) {
        showToast('error', 'Unauthorized', 'Administrative privileges required.');
        return;
      }
      const targetMember = allMembers.find((m) => m.id === targetUserId);
      if (
        targetMember?.email &&
        ['vardaansaxena096@gmail.com', 'cicrinventory@gmail.com', 'cicrinventoryofficial@gmail.com'].includes(targetMember.email.toLowerCase())
      ) {
        showToast('error', 'Action Restricted', 'Master superadmin roles cannot be modified.');
        return;
      }

      setProcessingUserId(targetUserId);
      const res = await updateUserRole(targetUserId, newRole);
      if (!res.success) {
        showToast('error', 'Role Update Failed', res.error || 'Failed to update member role.');
        return;
      }

      showToast('success', 'Role Updated', `${name} is now ${newRole.toUpperCase()}.`);
      await fetchAllMembers();
      await refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not change member role.';
      showToast('error', 'Role Update Failed', msg);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleApproveAccount = async (targetUserId: string, targetName: string, targetEmail?: string) => {
    setProcessingUserId(targetUserId);
    const res = await approveUserAccount(targetUserId, targetEmail);
    setProcessingUserId(null);
    if (res.success) {
      showToast('success', 'Account Approved', `${targetName} can now sign in.`);
      setPendingAccounts((prev) =>
        prev.filter((a) => a.id !== targetUserId && (!targetEmail || a.email?.toLowerCase() !== targetEmail.toLowerCase()))
      );
      await refreshData();
      await fetchPendingAccounts();
      await fetchAllMembers();
    } else {
      showToast('error', 'Approval Failed', res.error || 'Could not approve account');
    }
  };

  const handleRejectAccount = async (targetUserId: string, targetName: string, targetEmail?: string) => {
    setProcessingUserId(targetUserId);
    const res = await rejectUserAccount(targetUserId, targetEmail);
    setProcessingUserId(null);
    if (res.success) {
      showToast('warning', 'Request Rejected', `Account registration for ${targetName} was rejected.`);
      setPendingAccounts((prev) =>
        prev.filter((a) => a.id !== targetUserId && (!targetEmail || a.email?.toLowerCase() !== targetEmail.toLowerCase()))
      );
      await refreshData();
      await fetchPendingAccounts();
      await fetchAllMembers();
    } else {
      showToast('error', 'Rejection Failed', res.error || 'Could not reject account');
    }
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setSelectedItem(null);
    setAddItemModalOpen(true);
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from inventory?`)) {
      const res = await deleteItem(id);
      if (res.success) {
        showToast('info', 'Item Removed', `"${name}" removed from database.`);
      } else {
        showToast('error', 'Delete Failed', res.error);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({
      full_name: editName.trim(),
      roll_number: editEnrollment.trim(),
      phone: editPhone.trim(),
      avatar_url: editAvatarUrl || '',
    });
    setSavingProfile(false);
    if (res.success) {
      await refreshProfile();
      showToast('success', 'Profile Updated', 'Your profile details have been saved to the database.');
    } else {
      showToast('error', 'Update Failed', res.error || 'Could not update profile.');
    }
  };

  const lowReservesCount = items.filter((i) => isLowReserveItem(i)).length;
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const roleName = profile?.role === 'admin' ? 'ADMIN' : profile?.role === 'lead' ? 'LEAD' : 'MEMBER';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Top Floating Header Bar */}
      <TopNavbar
        activeView={activeView}
        setActiveView={setActiveView}
        isAdmin={isAdmin}
        isLeadOrAdmin={isLeadOrAdmin}
        cartCount={cart.reduce((s, c) => s + c.quantity, 0)}
        onOpenCart={() => setCartModalOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onDismissNotification={handleDismissNotification}
        lowReservesCount={lowReservesCount}
      />

      {/* 2. Main Workspace Body - Generous top spacing pt-24 sm:pt-28 md:pt-32 between floating navbar and hero section */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-24 sm:pt-28 md:pt-32 pb-36 sm:pb-44 space-y-8 animate-in fade-in duration-300">
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          <DashboardOverview
            userName={userName}
            roleName={roleName}
            setActiveView={setActiveView}
          />
        )}

        {/* VIEW 2: COMPONENT VAULT */}
        {activeView === 'inventory' && (
          <ComponentVaultView
            items={items}
            requests={requests}
            isAdmin={isAdmin}
            isLeadOrAdmin={isLeadOrAdmin}
            currentUserEmail={user?.email}
            currentUserId={user?.id}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAddToCart={handleAddToCart}
            onOpenAddItem={() => {
              setEditingItem(null);
              setAddItemModalOpen(true);
            }}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleDeleteItem}
            onSelectItem={(it) => setSelectedItem(it)}
            cartCount={cart.reduce((s, c) => s + c.quantity, 0)}
            onOpenCart={() => setCartModalOpen(true)}
          />
        )}

        {/* VIEW 3: REQUISITIONS & CLEARANCE PORTAL */}
        {activeView === 'review-requests' && (
          <RequisitionsView
            requests={requests}
            items={items}
            isLeadOrAdmin={isLeadOrAdmin}
            userEmail={user?.email}
            userId={user?.id}
            onNavigateToVault={() => setActiveView('inventory')}
            onBorrowAction={handleBorrowAction}
            onOpenIssuePass={(req) => setSelectedIssuePassReq(req)}
          />
        )}

        {/* VIEW 4: MANAGEMENT HUB & AUDIT LOGS */}
        {activeView === 'logs' && (
          <AdminHubView
            isAdmin={isAdmin}
            logs={logs}
            requests={requests}
            allMembers={allMembers}
            loadingMembers={loadingMembers}
            pendingAccounts={pendingAccounts}
            processingUserId={processingUserId}
            onPromoteRole={handlePromoteRole}
            onApproveAccount={handleApproveAccount}
            onRejectAccount={handleRejectAccount}
            onRefresh={async () => {
              await refreshData();
              await fetchPendingAccounts();
              await fetchAllMembers();
            }}
          />
        )}

        {/* VIEW 5: MEET THE DEVELOPERS TIMELINE */}
        {activeView === 'developers' && <MeetTheDevelopers />}

        {/* VIEW 6: OPERATOR PROFILE */}
        {activeView === 'profile' && (
          <OperatorProfileView
            userName={userName}
            userEmail={user?.email}
            roleName={roleName}
            editName={editName}
            setEditName={setEditName}
            editEnrollment={editEnrollment}
            setEditEnrollment={setEditEnrollment}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            editAvatarUrl={editAvatarUrl}
            setEditAvatarUrl={setEditAvatarUrl}
            savingProfile={savingProfile}
            onSaveProfile={handleSaveProfile}
            onOpenChangePassword={() => setChangePasswordOpen(true)}
            onRemoveAvatar={() => setEditAvatarUrl('')}
          />
        )}
      </main>

      {/* 3. Modern Bottom Docked Navbar */}
      <BottomNavbar
        activeView={activeView}
        setActiveView={setActiveView}
        activeCategory={categoryFilter}
        onSelectCategory={(cat) => setCategoryFilter(cat)}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
        pendingAccountsCount={pendingAccounts.length}
      />

      {/* 4. Modals */}
      <RequestCartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <AddEditItemModal
        isOpen={addItemModalOpen}
        onClose={() => {
          setAddItemModalOpen(false);
          setEditingItem(null);
        }}
        initialItem={editingItem}
      />

      <ItemDetailModal
        item={selectedItem}
        isAdmin={isAdmin}
        onEdit={handleOpenEditItem}
        onClose={() => setSelectedItem(null)}
        onBorrow={(it) => {
          handleAddToCart(it);
          setSelectedItem(null);
        }}
      />

      <IssuePassModal
        request={selectedIssuePassReq}
        item={items.find((i) => i.id === selectedIssuePassReq?.item_id)}
        onClose={() => setSelectedIssuePassReq(null)}
      />
    </div>
  );
};
