import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { BottomNavbar, ActiveView } from '../layout/BottomNavbar';
import { RequestCartModal, CartItem } from '../inventory/RequestCartModal';
import { ChangePasswordModal } from '../profile/ChangePasswordModal';
import { AddEditItemModal } from '../inventory/AddEditItemModal';
import { ItemDetailModal } from '../inventory/ItemDetailModal';
import { MeetTheDevelopers } from './MeetTheDevelopers';
import { InventoryItem } from '../../types/inventory';
import { CicrLogo } from '../common/CicrLogo';
import { MorphingDialog } from '../ui/morphing-dialog';
import { AnimatedFileUpload } from '../ui/animated-file-upload';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { useToast } from '../common/Toast';
import { compressImageToBase64 } from '../../lib/imageUtils';
import { AirportMatrixClock } from '../ui/airport-matrix-clock';
import { IOSSearchBar } from '../ui/ios-search-bar';
import { NotificationBell, Notification } from '../ui/notification-bell';
import { LiquidToggle } from '../ui/liquid-toggle';
import { useTheme } from '../../lib/theme/useTheme';
import {
  Layers,
  ShoppingBag,
  Bell,
  Code2,
  User,
  LayoutGrid,
  Cpu,
  Radar,
  Compass,
  Wrench,
  Search,
  X,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Key,
  Shield,
  ScrollText,
  Boxes,
  Database,
  ChevronDown,
  ChevronUp,
  Palette,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
  Calendar,
  Inbox,
  Mail,
  Hash,
  Phone,
  UserCheck,
  Users,
  Activity,
  ArrowUpRight,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Copy,
  Camera,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';

const isLowReserveItem = (i: InventoryItem): boolean => {
  if (i.available_qty <= 0) return false;
  const threshold = i.min_threshold ?? 2;
  const isBelowThreshold = i.available_qty <= threshold;
  const isHalfOrLess = i.total_qty > 0 && i.available_qty / i.total_qty <= 0.5;
  return isBelowThreshold || isHalfOrLess;
};


interface ParsedActivity {
  cleanSummary: string;
  meta: Record<string, any> | null;
}

const parseActivityDetails = (details: string): ParsedActivity => {
  if (!details) return { cleanSummary: 'No additional details logged', meta: null };
  const trimmed = details.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      const name = data.fullName || data.full_name || '';
      const email = data.email || '';
      const roll = data.enrollmentNo || data.enrollment_no || data.roll_number || '';
      const phone = data.phone || '';
      const role = data.role ? String(data.role).toUpperCase() : '';
      const status = data.status ? String(data.status).toUpperCase() : '';

      const summaryParts: string[] = [];
      if (name) summaryParts.push(name);
      if (email) summaryParts.push(email);
      if (roll) summaryParts.push(`Roll: ${roll}`);
      if (role) summaryParts.push(`Role: ${role}`);

      const cleanSummary = summaryParts.length > 0
        ? `Registration application submitted (${summaryParts.join(' • ')})`
        : `Record metadata: ${Object.entries(data).filter(([k]) => k !== 'password').map(([k, v]) => `${k}: ${v}`).join(' • ')}`;

      const safeMeta = { ...data };
      delete safeMeta.password;

      return {
        cleanSummary,
        meta: safeMeta,
      };
    } catch {
      // fallback to plain details
    }
  }
  return { cleanSummary: details, meta: null };
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
  } = useAuth();
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
  const { items, requests, logs, deleteItem, updateBorrowStatus, isLiveDatabase, refreshData } = useInventory();
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Search & Category & Status filters in Component Vault
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Request tab filter and search
  const [requestStatusTab, setRequestStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'returned'>('all');
  const [requestSearch, setRequestSearch] = useState('');

  // Profile edit fields (Avatar - Name - Email id - enrollment - contact number - role)
  const [editName, setEditName] = useState(profile?.full_name || (user?.user_metadata?.full_name as string) || '');
  const [editEnrollment, setEditEnrollment] = useState(profile?.roll_number || (user?.user_metadata?.enrollment_no as string) || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || (user?.user_metadata?.phone as string) || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(
    (profile?.avatar_url && !profile.avatar_url.startsWith('status:'))
      ? profile.avatar_url
      : ((user?.user_metadata?.avatar_url as string) || '')
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Admin Logs & Management Hub Tabs ('members' | 'logs-7d' | 'requests')
  const [adminLogsTab, setAdminLogsTab] = useState<'members' | 'logs-7d' | 'requests'>('members');
  const [pendingAccounts, setPendingAccounts] = useState<any[]>([]);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  // Full Member Roster and Management state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [selectedMemberActivityId, setSelectedMemberActivityId] = useState<string | null>(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);

  // 7-Day Activity Logs filters
  const [logDaysFilter, setLogDaysFilter] = useState<'7d' | '24h' | '3d' | 'all'>('7d');
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'borrow' | 'return' | 'account' | 'inventory'>('all');
  const [logSearch, setLogSearch] = useState('');

  // EasyUI Liquid Toggle Theme Switcher State
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDarkTheme = theme === 'dark';

  // Notification read-state persistent tracking
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`read_notifs_${user?.id || 'guest'}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleMarkNotifRead = (id: string) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(`read_notifs_${user?.id || 'guest'}`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleMarkAllNotifsRead = () => {
    const allIds = notificationsList.map((n) => n.id);
    const next = new Set(allIds);
    setReadNotifIds(next);
    try {
      localStorage.setItem(`read_notifs_${user?.id || 'guest'}`, JSON.stringify(Array.from(next)));
    } catch {}
  };

  // Comprehensive Backend-Synced Notifications
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);

  useEffect(() => {
    const list: Notification[] = [];

    // 1. Pending Borrow Requests (for Admin) / Member borrow updates
    if (isAdmin) {
      requests
        .filter((r) => r.status === 'pending')
        .slice(0, 10)
        .forEach((r) => {
          list.push({
            id: `req-${r.id}`,
            message: `${r.user_name || 'Member'} requested ${r.item_name || 'Component'} for ${r.project_name || 'Project'}`,
            timestamp: r.created_at || new Date().toISOString(),
            read: readNotifIds.has(`req-${r.id}`),
            action: () => setActiveView('review-requests'),
          });
        });

      // 2. Pending Member Registrations (for Admin)
      pendingAccounts.slice(0, 5).forEach((acc) => {
        list.push({
          id: `acc-${acc.id}`,
          message: `New Member Registration: ${acc.full_name || acc.email} awaiting clearance`,
          timestamp: acc.created_at || new Date().toISOString(),
          read: readNotifIds.has(`acc-${acc.id}`),
          action: () => {
            setActiveView('logs');
            setAdminLogsTab('requests');
          },
        });
      });
    } else {
      // Member-specific updates on their borrow requests
      requests
        .filter((r) => r.user_email === user?.email || r.user_id === user?.id)
        .slice(0, 10)
        .forEach((r) => {
          list.push({
            id: `myreq-${r.id}-${r.status}`,
            message: `Requisition for ${r.item_name}: Status is now ${r.status.toUpperCase()}`,
            timestamp: r.borrow_date || r.created_at || new Date().toISOString(),
            read: readNotifIds.has(`myreq-${r.id}-${r.status}`),
            action: () => setActiveView('review-requests'),
          });
        });
    }

    // 3. Low Reserves Alerts from inventory
    items.filter(isLowReserveItem).slice(0, 4).forEach((it) => {
      list.push({
        id: `low-${it.id}-${it.available_qty}`,
        message: `Low Reserve Alert: ${it.name} has only ${it.available_qty} units left in stock!`,
        timestamp: new Date().toISOString(),
        read: readNotifIds.has(`low-${it.id}-${it.available_qty}`),
        action: () => {
          setCategoryFilter('all');
          setStatusFilter('low');
          setActiveView('inventory');
        },
      });
    });

    setNotificationsList(list);
  }, [requests, pendingAccounts, items, isAdmin, user?.email, user?.id, readNotifIds]);

  // Admin note for requests
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  // Sync profile fields
  useEffect(() => {
    if (profile || user) {
      setEditName(profile?.full_name || (user?.user_metadata?.full_name as string) || '');
      setEditEnrollment(profile?.roll_number || (user?.user_metadata?.enrollment_no as string) || '');
      setEditPhone(profile?.phone || (user?.user_metadata?.phone as string) || '');
      const av = profile?.avatar_url || (user?.user_metadata?.avatar_url as string) || '';
      if (av && !av.startsWith('status:')) {
        setEditAvatarUrl(av);
      }
    }
  }, [profile, user]);

  // Fetch pending registration accounts for admin review
  const fetchPendingAccounts = async () => {
    try {
      const { data: profs } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('avatar_url', 'status:pending')
        .order('created_at', { ascending: false });

      const accountsMap = new Map<string, any>();

      if (profs) {
        profs.forEach((p) => {
          accountsMap.set(p.id, {
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            roll_number: p.roll_number,
            phone: p.phone,
            role: p.role,
            created_at: p.created_at,
            status: 'pending',
          });
        });
      }

      // Also parse from activity_logs
      const { data: logsData } = await supabaseAdmin
        .from('activity_logs')
        .select('*')
        .eq('action', 'ACCOUNT_REQUEST')
        .order('created_at', { ascending: false });

      if (logsData) {
        logsData.forEach((l) => {
          try {
            const details = typeof l.details === 'string' ? JSON.parse(l.details) : l.details;
            const uid = details?.userId || l.user_id || l.id || details?.email;
            const isPending = !details?.status || details?.status === 'pending';
            if (isPending && uid && !accountsMap.has(uid)) {
              accountsMap.set(uid, {
                id: uid,
                full_name: l.user_name || details?.fullName || details?.email?.split('@')[0],
                email: details?.email,
                roll_number: details?.enrollmentNo || details?.roll_number,
                phone: details?.phone,
                role: details?.role || 'member',
                created_at: l.created_at,
                status: 'pending',
                avatar_url: details?.avatar_url,
              });
            }
          } catch {
            // ignore
          }
        });
      }

      setPendingAccounts(Array.from(accountsMap.values()));
    } catch (err) {
      console.warn('Failed to load pending accounts:', err);
    }
  };

  // Fetch all registered members from Supabase profiles
  const fetchAllMembers = async () => {
    try {
      setLoadingMembers(true);
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllMembers(data);
      }
    } catch (err) {
      console.warn('Failed to load members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Dynamic role change for member management - 100% aligned with Supabase backend
  const handleUpdateRole = async (
    targetUserId: string,
    targetName: string,
    newRole: 'admin' | 'member'
  ) => {
    try {
      setUpdatingRoleUserId(targetUserId);

      // 1. Update in profiles table via supabaseAdmin (bypassing RLS)
      const { error: profError } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);

      if (profError) {
        showToast('error', 'Update Failed', profError.message);
        return;
      }

      // 2. Sync user_metadata in auth.users via supabaseAdmin
      try {
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { role: newRole },
        });
      } catch (authErr) {
        console.warn('Auth admin role sync warning:', authErr);
      }

      // 3. Immediately update local allMembers state
      setAllMembers((prev) =>
        prev.map((m) => (m.id === targetUserId ? { ...m, role: newRole } : m))
      );

      // 4. If current logged-in user changed, refresh their session profile
      if (user && targetUserId === user.id) {
        await refreshProfile();
      }

      // 5. Log audit trail in activity_logs
      try {
        await supabaseAdmin.from('activity_logs').insert([
          {
            user_id: user?.id,
            user_name: profile?.full_name || 'Admin',
            action: 'UPDATE_ROLE',
            details: `Updated role of "${targetName}" to ${newRole.toUpperCase()}`,
          },
        ]);
      } catch {
        // ignore
      }

      showToast('success', 'Role Updated', `Updated ${targetName}'s role to ${newRole.toUpperCase()}`);
      await fetchAllMembers();
    } catch (err) {
      showToast('error', 'Error', 'Failed to update member role');
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingAccounts();
      fetchAllMembers();
    }
  }, [isAdmin, activeView]);

  // Real-time ticking clock for Hero Banner (Image 1)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = currentTime
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member';
  const roleName = (
    profile?.role ||
    user?.user_metadata?.role ||
    (isAdmin ? 'ADMIN' : 'MEMBER')
  ).toUpperCase();

  // Active loans mapping: item_id -> count of loaned units
  const activeLoansByItem = requests
    .filter((r) => r.status === 'approved')
    .reduce<Record<string, number>>((acc, req) => {
      acc[req.item_id] = (acc[req.item_id] || 0) + req.quantity;
      return acc;
    }, {});

  const totalActiveLoansCount = requests.filter((r) => r.status === 'approved').length;
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  // Metrics calculations for 5 cards in Component Vault (Image 2)
  const totalAssetsCount = items.reduce((acc, i) => acc + (i.total_qty || 1), 0);
  const totalAvailableCount = items.reduce((acc, i) => acc + (i.available_qty || 0), 0);
  const lowReservesCount = items.filter(isLowReserveItem).length;
  const depletedCount = items.filter((i) => i.available_qty <= 0).length;

  // Filter items in Component Vault
  const filteredItems = items.filter((item) => {
    // Search query
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    let matchesCategory = true;
    if (categoryFilter === 'mcu') {
      matchesCategory = item.category === 'Microcontrollers & SBCs' || item.category === 'Controllers';
    } else if (categoryFilter === 'sensors') {
      matchesCategory = item.category === 'Sensors & Modules' || item.category === 'Sensors';
    } else if (categoryFilter === 'actuators') {
      matchesCategory = item.category === 'Motors & Drivers' || item.category === 'Actuators';
    } else if (categoryFilter === 'power') {
      matchesCategory = item.category === 'Power & Batteries' || item.category === 'Power';
    } else if (categoryFilter === 'tools') {
      matchesCategory = item.category === 'Tools & Fabrication' || item.category === 'Tools';
    }

    // Status card filter
    let matchesStatus = true;
    if (statusFilter === 'available') {
      matchesStatus = item.available_qty > 0;
    } else if (statusFilter === 'loans') {
      matchesStatus = !!activeLoansByItem[item.id];
    } else if (statusFilter === 'low') {
      matchesStatus = isLowReserveItem(item);
    } else if (statusFilter === 'depleted') {
      matchesStatus = item.available_qty <= 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Cart Management
  const handleAddToCart = (item: InventoryItem) => {
    if (item.available_qty <= 0) {
      showToast('error', 'Item Depleted', 'No units available for checkout.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.available_qty) {
          showToast('info', 'Max Quantity Reached', `Only ${item.available_qty} units available.`);
          return prev;
        }
        showToast('success', 'Cart Updated', `Increased quantity for ${item.name}.`);
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      showToast('success', 'Added to Request Cart', `${item.name} staged for requisition.`);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    showToast('info', 'Removed', 'Item removed from staged hardware cart.');
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

  const handleBorrowAction = async (
    requestId: string,
    action: 'approved' | 'rejected' | 'returned'
  ) => {
    const note = adminNote[requestId];
    const res = await updateBorrowStatus(requestId, action, note);
    if (res.success) {
      showToast('success', `Request ${action.toUpperCase()}`, `Requisition marked as ${action}.`);
    } else {
      showToast('error', 'Update Failed', res.error);
    }
  };

  const handleApproveAccount = async (targetUserId: string, targetName: string) => {
    setProcessingUserId(targetUserId);
    const res = await approveUserAccount(targetUserId);
    setProcessingUserId(null);
    if (res.success) {
      showToast('success', 'Account Approved', `${targetName} can now sign in.`);
      setPendingAccounts((prev) => prev.filter((a) => a.id !== targetUserId));
      await refreshData();
      await fetchPendingAccounts();
      await fetchAllMembers();
    } else {
      showToast('error', 'Approval Failed', res.error || 'Could not approve account');
    }
  };

  const handleRejectAccount = async (targetUserId: string, targetName: string) => {
    setProcessingUserId(targetUserId);
    const res = await rejectUserAccount(targetUserId);
    setProcessingUserId(null);
    if (res.success) {
      showToast('warning', 'Request Rejected', `Account registration for ${targetName} was rejected.`);
      setPendingAccounts((prev) => prev.filter((a) => a.id !== targetUserId));
      await refreshData();
      await fetchPendingAccounts();
      await fetchAllMembers();
    } else {
      showToast('error', 'Rejection Failed', res.error || 'Could not reject account');
    }
  };

  const handleProfileAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file, 256, 0.85);
      setEditAvatarUrl(base64);
      showToast('info', 'Avatar Selected', 'Click "Save Profile" to update your photo in the database.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process image';
      showToast('error', 'Image Error', msg);
    }
  };

  const handleRemoveProfileAvatar = () => {
    setEditAvatarUrl('');
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = '';
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
      showToast('success', 'Profile Updated', 'Your profile details and avatar have been saved to the database.');
    } else {
      showToast('error', 'Update Failed', res.error || 'Could not update profile.');
    }
  };

  // Helper tags for cards
  const getItemTags = (item: InventoryItem): string[] => {
    const tags: string[] = [];
    if (item.name.toLowerCase().includes('cable')) tags.push('#Cables');
    if (item.name.toLowerCase().includes('arduino')) tags.push('#Arduino');
    if (item.name.toLowerCase().includes('resistor')) tags.push('#Resistor Box', '#Passives');
    if (item.name.toLowerCase().includes('wire')) tags.push('#Wiring', '#Silicone');
    if (item.name.toLowerCase().includes('potentiometer')) tags.push('#Potentiometer', '#Variable Resistor');
    if (item.name.toLowerCase().includes('relay')) tags.push('#Relay', '#Optocoupler');
    if (item.name.toLowerCase().includes('buck')) tags.push('#Buck Converter', '#DC-DC');
    if (item.name.toLowerCase().includes('cam')) tags.push('#Camera', '#Vision');
    if (item.name.toLowerCase().includes('i2c')) tags.push('#I2C', '#Display');
    if (item.name.toLowerCase().includes('esp')) tags.push('#ESP32', '#IoT');
    if (item.name.toLowerCase().includes('motor') || item.name.toLowerCase().includes('stepper'))
      tags.push('#Motor', '#Actuator');
    if (item.name.toLowerCase().includes('battery') || item.name.toLowerCase().includes('lipo'))
      tags.push('#Battery', '#Power');
    if (item.name.toLowerCase().includes('sensor') || item.name.toLowerCase().includes('lidar'))
      tags.push('#Sensors', '#Optics');
    if (tags.length === 0) tags.push('#Hardware', `#${item.category.split(' ')[0]}`);
    return tags.slice(0, 2);
  };

  const getItemCategoryLabel = (category: string): string => {
    if (category.includes('Power')) return 'POWER';
    if (category.includes('Micro')) return 'MCU';
    if (category.includes('Sensors')) return 'SENSORS';
    if (category.includes('Motors')) return 'ACTUATORS';
    if (category.includes('Tools')) return 'TOOLS';
    return 'HARDWARE';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Top Floating Island Header Bar (Permanently Fixed on All Mobile & Desktop Screens on Scroll) */}
      <div className="fixed top-2 sm:top-3 inset-x-0 z-40 max-w-[1720px] w-full mx-auto px-2 sm:px-6 lg:px-8 xl:px-10 pointer-events-none">
        <header className="pointer-events-auto rounded-full bg-white/95 dark:bg-[#0f0f16]/95 backdrop-blur-2xl border-2 border-slate-200 dark:border-[#222230] px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/80 gap-2">
          {/* Left: CICR Logo + Breadcrumbs Capsule */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 cursor-pointer group shrink-0 focus-visible:outline-none"
              title="CICR Inventory Dashboard"
            >
              <CicrLogo size={42} className="rounded-2xl shadow-sm group-hover:scale-105 transition-transform shrink-0" />
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
                  CICR Inventory
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase mt-0.5">
                  Robotics Lab
                </span>
              </div>
            </button>
            <div className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-zinc-400">
              <span
                className="hidden sm:inline text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                onClick={() => setActiveView('dashboard')}
              >
                HOME
              </span>
              <span className="hidden sm:inline text-zinc-600">/</span>
              <span
                className="text-slate-900 dark:text-white uppercase tracking-wider font-extrabold cursor-pointer truncate max-w-[120px] sm:max-w-none"
                onClick={() => {
                  setCategoryFilter('all');
                  setActiveView('inventory');
                }}
              >
                {activeView === 'inventory' ? 'INVENTORY' : activeView.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right Controls: Cart (ONLY on Inventory Page), Notifications, Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cart Pill: ONLY VISIBLE ON INVENTORY PAGE */}
            {activeView === 'inventory' && (
              <button
                type="button"
                onClick={() => setCartModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-[#151520] hover:bg-slate-200 dark:hover:bg-[#1c1c2b] border border-slate-200 dark:border-zinc-800 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-zinc-300 transition-all cursor-pointer animate-in fade-in"
                title="View Hardware Cart"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-50 dark:bg-purple-950/80 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
                <span className="hidden md:inline">CART</span>
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0">
                  {cart.length}
                </span>
              </button>
            )}

            {/* EasyUI Micro-Animated Notification Bell */}
            <div className="shrink-0 flex items-center">
              <NotificationBell
                notifications={notificationsList}
                onMarkAsRead={handleMarkNotifRead}
                onMarkAllAsRead={handleMarkAllNotifsRead}
              />
            </div>

            {/* EasyUI Liquid Toggle Theme Switcher */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0"
              title="Toggle Robosoccer Cyber Theme"
            >
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400 shrink-0" />
              <span className="hidden md:inline font-semibold">Theme</span>
              <LiquidToggle
                value={isDarkTheme}
                onChange={(val) => setTheme(val ? "dark" : "light")}
                width={48}
                height={26}
                showLabels={false}
                accentColor={isDarkTheme ? "#9333ea" : "#2563eb"}
              />
            </div>
          </div>
        </header>
      </div>

      {/* Main Workspace Body - Responsively fills wide monitors while keeping comfortable margins */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-16 sm:pt-20 pb-36 sm:pb-44 space-y-8 animate-in fade-in duration-300">
        
        {/* ============================================================== */}
        {/* VIEW 1: DASHBOARD (Matching Screenshot 1) */}
        {/* ============================================================== */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Greeting & Live Clock Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold font-mono tracking-widest text-blue-600 dark:text-purple-400 uppercase">
                  {roleName} DASHBOARD
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                </p>
              </div>

              {/* EasyUI Airport Matrix Departure Board Clock (Screenshot 2 Live Departure Format) */}
              <div className="shrink-0 w-full lg:w-auto max-w-full">
                <AirportMatrixClock
                  cities={['new-delhi']}
                  format="24h"
                  showSeconds={true}
                  updateInterval={1000}
                  showCountry={true}
                  showControls={false}
                  className="w-full sm:min-w-[340px] md:min-w-[420px]"
                />
              </div>
            </div>

            {/* 4 Interactive Hub Cards (Auto-fills wide screens: 4 columns on desktop, 2x2 on tablet, 1 on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Card 1: Component Vault */}
              <div
                onClick={() => {
                  setCategoryFilter('all');
                  setActiveView('inventory');
                }}
                className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-bold font-mono">
                      CATALOG
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                    Component Vault
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Browse and search the repository of microcontrollers, sensors, actuators, and hardware components.
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-emerald-400 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Request Cart */}
              <div
                onClick={() => setCartModalOpen(true)}
                className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-bold font-mono">
                      HARDWARE CART
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                    Request Cart
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Review staged components, inspect loan allocations, and dispatch 1-go consolidated hardware requisitions.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-emerald-400 font-mono">
                    {cart.length} items loaded
                  </span>
                  <div className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Card 3: Meet The Developers */}
              <div
                onClick={() => setActiveView('developers')}
                className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-purple-950/70 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-400 flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-bold font-mono">
                      THE CREATORS
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                    Meet The Developers
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Meet the engineering minds and mentors behind the CICR Robotics Vault.
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: My Profile */}
              <div
                onClick={() => setActiveView('profile')}
                className="group p-6 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 hover:shadow-lg hover:bg-slate-50/50 dark:hover:bg-[#13131c] cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-purple-950/70 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-400 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-bold font-mono">
                      OPERATOR HUD
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                    My Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Inspect credentials, verified student tier, active hardware checkouts, and security controls.
                  </p>
                </div>
                <div className="flex items-center justify-end pt-2 text-zinc-500 group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: COMPONENT VAULT / INVENTORY (Matching Screenshot 2 & 3) */}
        {/* ============================================================== */}
        {activeView === 'inventory' && (
          <div className="space-y-6 pb-20">
            
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Component Vault
              </h1>
            </div>

            {/* Search Bar & Vault Category Tabs (Screenshot 2) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-4 shadow-sm">
              {/* EasyUI iOS Micro-Interactive Search Bar */}
              <div className="w-full">
                <IOSSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search components..."
                  className="w-full"
                  collapsedWidth="100%"
                  expandedWidth="100%"
                />
              </div>

              {/* Vault Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* All */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All</span>
                </button>

                {/* MCU */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('mcu')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'mcu'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>MCU</span>
                </button>

                {/* Sensors */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('sensors')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'sensors'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Sensors</span>
                </button>

                {/* Actuators */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('actuators')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'actuators'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Actuators</span>
                </button>

                {/* Power */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('power')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'power'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Power</span>
                </button>

                {/* Tools */}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('tools')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'tools'
                      ? 'bg-blue-600 dark:bg-purple-600 text-white border-2 border-blue-600 dark:border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-800 font-bold'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tools</span>
                </button>
              </div>
            </div>

            {/* 5 Status Metrics Cards Row (Screenshot 2) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Total Assets ALL */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'all' : 'all')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0f0f15] border-2 cursor-pointer transition-all shadow-sm ${
                  statusFilter === 'all' ? 'border-zinc-700' : 'border-slate-200 dark:border-[#20202c] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Total Assets</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-bold">
                    ALL
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{totalAssetsCount}</div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">In laboratory inventory</p>
              </div>

              {/* Available FILTER */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0f0f15] border-2 cursor-pointer transition-all shadow-sm ${
                  statusFilter === 'available'
                    ? 'border-blue-600 dark:border-purple-600 bg-blue-50 dark:bg-purple-950/30 text-blue-900'
                    : 'border-slate-200 dark:border-[#20202c] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Available</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-bold">
                    FILTER
                  </span>
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-emerald-400">{totalAvailableCount}</div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">Ready for checkout</p>
              </div>

              {/* Active Loans FILTER */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'loans' ? 'all' : 'loans')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0f0f15] border-2 cursor-pointer transition-all shadow-sm ${
                  statusFilter === 'loans'
                    ? 'border-slate-800 bg-slate-100 dark:bg-slate-900'
                    : 'border-slate-200 dark:border-[#20202c] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Active Loans</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-bold">
                    FILTER
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-cyan-400">{totalActiveLoansCount}</div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">Checked out by members</p>
              </div>

              {/* Low Reserves FILTER */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0f0f15] border-2 cursor-pointer transition-all shadow-sm ${
                  statusFilter === 'low'
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-200 dark:border-[#20202c] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Low Reserves</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-bold">
                    FILTER
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowReservesCount}</div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">≤ 2 units or ≤ 50%</p>
              </div>

              {/* Depleted FILTER */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'depleted' ? 'all' : 'depleted')}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0f0f15] border-2 cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                  statusFilter === 'depleted'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-900'
                    : 'border-slate-200 dark:border-[#20202c] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Depleted</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 font-mono font-bold">
                    FILTER
                  </span>
                </div>
                <div className="text-2xl font-black text-red-600 dark:text-rose-400">{depletedCount}</div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">0 units in stock</p>
              </div>
            </div>

            {/* Catalog Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Catalog Components
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border-2 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 font-bold font-mono">
                    Showing {filteredItems.length} components
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Click any component to inspect specifications or add to your request cart
                </p>
              </div>

              {isLeadOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setAddItemModalOpen(true);
                  }}
                  className="btn-auth-primary flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Component</span>
                </button>
              )}
            </div>

            {/* Component Cards Grid (Matching Screenshot 3) */}
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 space-y-2 bg-[#0f0f15] border border-zinc-800 rounded-3xl p-8">
                <Boxes className="w-10 h-10 text-zinc-700 mx-auto" />
                <p className="text-zinc-300 font-bold text-sm">No components found</p>
                <p className="text-zinc-500">
                  Try adjusting your search query or clear the active category/status filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredItems.map((item) => {
                  const isAvailable = item.available_qty > 0;
                  const isLow = isLowReserveItem(item);
                  const isDepleted = item.available_qty <= 0;
                  const activeLoanCount = activeLoansByItem[item.id] || 0;
                  const availabilityRatio =
                    item.total_qty > 0 ? (item.available_qty / item.total_qty) * 100 : 0;
                  const tags = getItemTags(item);
                  const categoryTag = getItemCategoryLabel(item.category);

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] hover:border-blue-500 dark:hover:border-purple-500 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group"
                    >
                      {/* Top Row: Category Pill & Availability Status */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 font-bold font-mono">
                            {categoryTag}
                          </span>

                          {isDepleted ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-rose-400">
                              <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-rose-500" />
                              <span>Depleted</span>
                            </span>
                          ) : isLow ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Low Reserve</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-emerald-600" />
                              <span>Available</span>
                            </span>
                          )}
                        </div>

                        {/* Item Name */}
                        <h3
                          onClick={() => setSelectedItem(item)}
                          className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors cursor-pointer truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description || 'Verified lab hardware component.'}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          {tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#161622] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800/80 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Active Loan Banner (from Screenshot 3) */}
                      {activeLoanCount > 0 && (
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-purple-950/40 border border-blue-200 dark:border-purple-500/30 flex items-center justify-between text-[11px] text-blue-700 dark:text-purple-300 font-semibold">
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-purple-400" />
                            <span>{activeLoanCount} unit on active loan</span>
                          </div>
                          <span
                            onClick={() => setActiveView('review-requests')}
                            className="text-[10px] text-blue-600 dark:text-purple-300 hover:underline font-bold cursor-pointer shrink-0 ml-1"
                          >
                            Inspect →
                          </span>
                        </div>
                      )}

                      {/* Location & Availability Row */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 text-[11px]">
                            <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{item.location}</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="text-slate-500 dark:text-zinc-500 uppercase text-[9px] font-bold">AVAILABILITY</span>
                            <span className={`font-bold ${isDepleted ? "text-red-600 dark:text-rose-400" : isLow ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-emerald-400"}`}>
                              {item.available_qty} / {item.total_qty}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar (from Screenshot 3) */}
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDepleted
                                ? 'bg-red-600 dark:bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-blue-600 dark:bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, availabilityRatio))}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Footer: + Add to Cart & Delete */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={!isAvailable}
                          className="btn-auth-primary flex-1 py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Add to Cart</span>
                        </button>

                        {isLeadOrAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-2 rounded-2xl bg-[#14141c] hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-colors"
                            title="Delete Component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: REVIEW REQUESTS (PERSONALIZED FOR MEMBERS / ADMIN QUEUE FOR ADMINS) */}
        {/* ============================================================== */}
        {activeView === 'review-requests' && (
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-purple-400" />
                  {isLeadOrAdmin
                    ? 'Review Requests (All User Requisitions)'
                    : 'My Requisitions & Checkouts'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {isLeadOrAdmin
                    ? 'Requisitions submitted by club members for component checkouts and approvals'
                    : 'Track the real-time status of your hardware checkouts, approvals, and return deadlines'}
                </p>
              </div>

              {!isLeadOrAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveView('inventory')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-md shadow-blue-600/25 dark:shadow-purple-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Borrow Hardware</span>
                </button>
              )}
            </div>

            {/* Filter Tabs & Search Controls */}
            {(() => {
              const activeRequestsList = isLeadOrAdmin
                ? requests
                : requests.filter(
                    (r) =>
                      r.user_email === user?.email ||
                      r.user_id === user?.id ||
                      (user?.email &&
                        r.user_email?.toLowerCase() === user.email.toLowerCase())
                  );

              const pendingCount = activeRequestsList.filter((r) => r.status === 'pending').length;
              const approvedCount = activeRequestsList.filter((r) => r.status === 'approved').length;
              const rejectedCount = activeRequestsList.filter((r) => r.status === 'rejected').length;
              const returnedCount = activeRequestsList.filter((r) => r.status === 'returned').length;

              const filteredList = activeRequestsList.filter((req) => {
                const matchesTab =
                  requestStatusTab === 'all' || req.status === requestStatusTab;
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
                <div className="space-y-4">
                  {/* Status Pills and Search bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0 no-scrollbar scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Input */}
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

                  {/* List of Requests */}
                  {filteredList.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl bg-[#121219] border border-zinc-800/70 p-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-purple-950/40 border-2 border-blue-200 dark:border-purple-500/30 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        {requestStatusTab === 'all'
                          ? 'No borrow requests found'
                          : `No ${requestStatusTab} requests found`}
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        {!isLeadOrAdmin
                          ? 'You currently have no requisitions in this tab. Explore our component vault to check out electronics.'
                          : 'No requisitions currently match this filter criteria.'}
                      </p>
                      {!isLeadOrAdmin && (
                        <button
                          type="button"
                          onClick={() => setActiveView('inventory')}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/25 dark:shadow-purple-950/40"
                        >
                          <Boxes className="w-4 h-4" />
                          <span>Browse Component Vault</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                      {filteredList.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-purple-500 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs shadow-sm"
                        >
                          {/* Info Column */}
                          <div className="space-y-2 min-w-0 flex-1">
                            {/* Title & Quantity & Status Pill */}
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
                                {req.status === 'approved' ? 'Approved / Active' : req.status}
                              </span>
                            </div>

                            {/* Borrower info (Only prominent for Admins) */}
                            {isLeadOrAdmin && (
                              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                <User className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Borrower:</span>
                                <strong className="text-white font-semibold">{req.user_name}</strong>
                                <span className="text-zinc-500 font-mono text-[11px]">({req.user_email})</span>
                              </div>
                            )}

                            {/* Project & Purpose */}
                            <div className="text-zinc-400 space-y-1">
                              <div>
                                <span className="text-zinc-500">Project: </span>
                                <span className="text-blue-600 dark:text-purple-400 font-semibold">{req.project_name}</span>
                                {req.purpose && (
                                  <>
                                    <span className="text-zinc-600 mx-1.5">•</span>
                                    <span className="text-zinc-300">{req.purpose}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Dates Timeline */}
                            <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-500" />
                                <span>Requested: </span>
                                <strong className="text-zinc-300 font-medium">
                                  {req.created_at ? req.created_at.split('T')[0] : 'Recently'}
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400/80" />
                                <span>Expected Return: </span>
                                <strong className="text-amber-300 font-medium">{req.expected_return_date}</strong>
                              </span>
                              {req.actual_return_date && (
                                <span className="text-blue-600 dark:text-purple-400 font-semibold">
                                  Returned on: {req.actual_return_date}
                                </span>
                              )}
                            </div>

                            {/* Admin Note / Instructions (if any) */}
                            {req.admin_notes && (
                              <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-[#1b1b26] border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                                <span className="font-bold text-white">Admin Note: </span>
                                {req.admin_notes}
                              </div>
                            )}
                          </div>

                          {/* Action Column for Admins */}
                          {isLeadOrAdmin && (
                            <div className="flex flex-col sm:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                              {req.status === 'pending' && (
                                <div className="space-y-2 w-full sm:w-auto">
                                  {/* Optional note input */}
                                  <input
                                    type="text"
                                    value={adminNote[req.id] || ''}
                                    onChange={(e) =>
                                      setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                                    }
                                    placeholder="Optional note / locker..."
                                    className="w-full sm:w-48 px-2.5 py-1 text-[11px] bg-[#0c0c12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 dark:focus:border-purple-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleBorrowAction(req.id, 'approved')}
                                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-bold text-xs cursor-pointer shadow-md transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleBorrowAction(req.id, 'rejected')}
                                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700/80 text-rose-300 font-bold text-xs cursor-pointer shadow-md transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}

                              {req.status === 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleBorrowAction(req.id, 'returned')}
                                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/25 dark:shadow-purple-950/40 transition-colors flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-white" />
                                  <span>Mark Returned & Restock</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: ADMIN COMMAND, LOGS & MEMBER MANAGEMENT HUB */}
        {/* ============================================================== */}
        {activeView === 'logs' && (
          isAdmin ? (
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                    <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-purple-400" />
                    CICR Management Hub & Activity Logs
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    Club member directory, laboratory activity history, and user registration approvals
                  </p>
                </div>
              </div>

              {/* 4 Summary Metrics Cards */}
              {(() => {
                const nowMs = Date.now();
                const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
                const sevenDayLogsCount = logs.filter(
                  (l) => new Date(l.created_at).getTime() >= sevenDaysAgoMs
                ).length;
                const activeLoansCount = requests.filter((r) => r.status === 'approved').length;

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Registered Members */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800/90 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Club Members</span>
                        <Users className="w-4 h-4 text-blue-600 dark:text-purple-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {loadingMembers ? '...' : allMembers.length}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Registered laboratory roster</p>
                    </div>

                    {/* Card 2: 7-Day Activity Operations */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800/90 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Last 7 Days</span>
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {sevenDayLogsCount}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Operations logged this week</p>
                    </div>

                    {/* Card 3: Pending Account Approvals */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800/90 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Pending Signups</span>
                        <UserCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{pendingAccounts.length}</span>
                        {pendingAccounts.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 font-bold">
                            Requires Action
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Awaiting admin clearance</p>
                    </div>

                    {/* Card 4: Active Checkouts */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800/90 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Active Loans</span>
                        <Boxes className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {activeLoansCount}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Hardware currently borrowed</p>
                    </div>
                  </div>
                );
              })()}

              {/* Management Tabs: Members Roster vs 7-Day History vs Pending Requests */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 max-w-full overflow-x-auto no-scrollbar">
                  {/* Tab 1: Members Roster & Activity */}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLogsTab('members');
                      setSelectedMemberActivityId(null);
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      adminLogsTab === 'members'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                    <span>Club Members</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-extrabold">
                      {allMembers.length}
                    </span>
                  </button>

                  {/* Tab 2: 7-Day Activity History */}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLogsTab('logs-7d');
                      setSelectedMemberActivityId(null);
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      adminLogsTab === 'logs-7d'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Activity Logs</span>
                    {(() => {
                      const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
                      const count = logs.filter(
                        (l) => new Date(l.created_at).getTime() >= sevenDaysAgoMs
                      ).length;
                      return (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                          {count}
                        </span>
                      );
                    })()}
                  </button>

                  {/* Tab 3: Account Requests */}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLogsTab('requests');
                      setSelectedMemberActivityId(null);
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      adminLogsTab === 'requests'
                        ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Account Requests</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      pendingAccounts.length > 0
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {pendingAccounts.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* SUB-TAB 1: CLUB MEMBERS ROSTER & ACTIVITY MANAGEMENT */}
              {/* ============================================================== */}
              {adminLogsTab === 'members' && (
                <div className="space-y-4">
                  {/* Search and Role Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Search members..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:border-blue-500 dark:focus:border-purple-500 transition-colors"
                      />
                      {memberSearch && (
                        <button
                          type="button"
                          onClick={() => setMemberSearch('')}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Role Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {(['all', 'admin', 'member'] as const).map((rKey) => {
                        const count =
                          rKey === 'all'
                            ? allMembers.length
                            : allMembers.filter((m) => (m.role || 'member') === rKey).length;
                        return (
                          <button
                            key={rKey}
                            type="button"
                            onClick={() => setMemberRoleFilter(rKey)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                              memberRoleFilter === rKey
                                ? 'bg-blue-600 dark:bg-purple-600 text-white font-black shadow-sm'
                                : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800'
                            }`}
                          >
                            {rKey === 'all' ? 'All Roles' : `${rKey}s`} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Members List */}
                  {(() => {
                    const filteredMembers = allMembers.filter((m) => {
                      const matchesRole =
                        memberRoleFilter === 'all' || (m.role || 'member') === memberRoleFilter;
                      const q = memberSearch.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        (m.full_name && m.full_name.toLowerCase().includes(q)) ||
                        (m.email && m.email.toLowerCase().includes(q)) ||
                        (m.roll_number && m.roll_number.toLowerCase().includes(q)) ||
                        (m.phone && m.phone.toLowerCase().includes(q));
                      return matchesRole && matchesSearch;
                    });

                    if (loadingMembers) {
                      return (
                        <div className="py-16 text-center text-xs text-zinc-400 space-y-2">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 dark:text-purple-400" />
                          <p>Loading member directory from database...</p>
                        </div>
                      );
                    }

                    if (filteredMembers.length === 0) {
                      return (
                        <div className="py-16 text-center rounded-2xl bg-[#14141c]/60 border border-zinc-800 space-y-2">
                          <Users className="w-10 h-10 text-zinc-600 mx-auto" />
                          <p className="text-sm font-bold text-white">No Members Found</p>
                          <p className="text-xs text-zinc-400">
                            {memberSearch ? 'Try a different search keyword.' : 'No members registered yet.'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {filteredMembers.map((member) => {
                          const memberRequests = requests.filter(
                            (r) =>
                              r.user_id === member.id ||
                              (member.email &&
                                r.user_email?.toLowerCase() === member.email.toLowerCase())
                          );
                          const memberActiveLoans = memberRequests.filter(
                            (r) => r.status === 'approved'
                          ).length;
                          const memberLogs = logs.filter(
                            (l) =>
                              l.user_id === member.id ||
                              (member.full_name &&
                                l.user_name?.toLowerCase().includes(member.full_name.toLowerCase())) ||
                              (member.full_name &&
                                l.details?.toLowerCase().includes(member.full_name.toLowerCase()))
                          );

                          const isExpanded = selectedMemberActivityId === member.id;
                          const isUpdatingRole = updatingRoleUserId === member.id;

                          return (
                            <div
                              key={member.id}
                              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14141c] border-2 transition-all space-y-3.5 shadow-sm ${
                                isExpanded
                                  ? 'border-blue-600 dark:border-purple-600 ring-2 ring-blue-500/30 dark:ring-purple-500/40'
                                  : 'border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-purple-500'
                              }`}
                            >
                              {/* Top Bar: Avatar, Full Name, Role Badge, Status */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Avatar Circle */}
                                  <div className="w-11 h-11 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 ring-2 ring-blue-500/30 dark:ring-purple-500/40 shadow-md overflow-hidden">
                                    {member.avatar_url && !member.avatar_url.startsWith('status:') ? (
                                      <img src={member.avatar_url} alt={member.full_name || 'Member'} className="w-full h-full object-cover" />
                                    ) : (
                                      (member.full_name || member.email || 'M').charAt(0).toUpperCase()
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-sm text-white truncate max-w-[170px]">
                                        {member.full_name || 'Member'}
                                      </h4>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                          member.role === 'admin'
                                            ? 'bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border-blue-200 dark:border-purple-500/40'
                                            : member.role === 'lead'
                                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                        }`}
                                      >
                                        {member.role || 'MEMBER'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate max-w-[220px]">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Dot */}
                                <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Active</span>
                                </div>
                              </div>

                              {/* Member Credentials Info (Enrollment, Phone, Join Date) */}
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-[#0c0c12]/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/60 font-mono">
                                <div className="truncate">
                                  <span className="text-zinc-500 block text-[9px] uppercase font-sans font-bold">
                                    Enrollment No
                                  </span>
                                  <span className="text-zinc-200">{member.roll_number || 'N/A'}</span>
                                </div>
                                <div className="truncate">
                                  <span className="text-zinc-500 block text-[9px] uppercase font-sans font-bold">
                                    Contact Phone
                                  </span>
                                  <span className="text-zinc-200">{member.phone || 'N/A'}</span>
                                </div>
                              </div>

                              {/* Hardware Stats & Activity Pill */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
                                <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                                  <span>
                                    <strong className="text-white">{memberRequests.length}</strong> requisitions
                                  </span>
                                  <span>•</span>
                                  <span>
                                    <strong className="text-emerald-400">{memberActiveLoans}</strong> active loans
                                  </span>
                                </div>

                                {/* Action Buttons: View Activity Trail & Change Role */}
                                <div className="flex items-center gap-1.5">
                                  {/* Role Selector */}
                                  <select
                                    disabled={isUpdatingRole}
                                    value={member.role || 'member'}
                                    onChange={(e) =>
                                      handleUpdateRole(
                                        member.id,
                                        member.full_name || member.email,
                                        e.target.value as 'admin' | 'member'
                                      )
                                    }
                                    className="px-2 py-1 bg-slate-100 dark:bg-[#171722] hover:bg-slate-200 dark:hover:bg-[#202030] text-slate-800 dark:text-zinc-300 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 outline-none cursor-pointer disabled:opacity-50"
                                    title="Change User Role"
                                  >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                  </select>

                                  {/* Toggle Member Activity Trail */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedMemberActivityId(isExpanded ? null : member.id)
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      isExpanded
                                        ? 'bg-blue-600 dark:bg-purple-600 text-white'
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                    }`}
                                  >
                                    <Activity className="w-3 h-3" />
                                    <span>{isExpanded ? 'Hide' : 'Activities'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Inline Expanded Activity Trail for This Member */}
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-purple-500/40 space-y-2 animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-purple-400">
                                    <span>Personal Activity History ({memberLogs.length})</span>
                                    <span className="text-[10px] text-zinc-500">Live Supabase Feed</span>
                                  </div>

                                  {memberLogs.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-3 text-center">
                                      No direct logs recorded for this member yet.
                                    </p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                                      {memberLogs.map((log) => (
                                        <div
                                          key={log.id}
                                          className="p-2 rounded-xl bg-[#0c0c12] border border-zinc-800 text-[11px] space-y-0.5"
                                        >
                                          <div className="flex items-center justify-between text-zinc-400">
                                            <span className="font-bold text-white capitalize">
                                              {log.action.replace(/_/g, ' ').toLowerCase()}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                              {new Date(log.created_at).toLocaleString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-zinc-300 text-[11px] leading-tight">
                                            {log.details}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ============================================================== */}
              {/* SUB-TAB 2: 7-DAY IMMUTABLE ACTIVITY HISTORY */}
              {/* ============================================================== */}
              {adminLogsTab === 'logs-7d' && (
                <div className="space-y-4">
                  

                  {/* Filter Controls: Time Range Selector, Category Selector, and Search Bar */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* EasyUI iOS Search Bar in 7-day logs */}
                      <div className="flex-1 max-w-md">
                        <IOSSearchBar
                          value={logSearch}
                          onChange={setLogSearch}
                          placeholder="Search logs..."
                          className="w-full"
                          collapsedWidth="100%"
                          expandedWidth="100%"
                        />
                      </div>

                      {/* Timeframe Selector Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                          { key: '7d', label: 'Last 7 Days (Default)' },
                          { key: '24h', label: 'Last 24 Hours' },
                          { key: '3d', label: 'Last 3 Days' },
                          { key: 'all', label: 'All Records' },
                        ].map((tf) => (
                          <button
                            key={tf.key}
                            type="button"
                            onClick={() => setLogDaysFilter(tf.key as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              logDaysFilter === tf.key
                                ? 'bg-blue-600 dark:bg-purple-600 text-white font-black shadow-sm'
                                : 'bg-slate-100 dark:bg-[#14141c] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800'
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { key: 'all', label: 'All Activities' },
                        { key: 'borrow', label: 'Borrows & Checkouts' },
                        { key: 'return', label: 'Returns' },
                        { key: 'account', label: 'Account Actions' },
                        { key: 'inventory', label: 'Component Updates' },
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setLogCategoryFilter(cat.key as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            logCategoryFilter === cat.key
                              ? 'bg-zinc-700 text-white'
                              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7-Day Log Stream */}
                  {(() => {
                    const now = Date.now();
                    const cutoffMs = {
                      '24h': now - 24 * 60 * 60 * 1000,
                      '3d': now - 3 * 24 * 60 * 60 * 1000,
                      '7d': now - 7 * 24 * 60 * 60 * 1000,
                      all: 0,
                    }[logDaysFilter];

                    const filteredLogs = logs.filter((log) => {
                      const logTime = new Date(log.created_at).getTime();
                      if (cutoffMs > 0 && logTime < cutoffMs) return false;

                      // Category filter
                      if (logCategoryFilter === 'borrow') {
                        const isBorrow =
                          log.action?.toLowerCase().includes('borrow') ||
                          log.action?.toLowerCase().includes('approved') ||
                          log.details?.toLowerCase().includes('borrow') ||
                          log.details?.toLowerCase().includes('requested');
                        if (!isBorrow) return false;
                      } else if (logCategoryFilter === 'return') {
                        const isReturn =
                          log.action?.toLowerCase().includes('return') ||
                          log.details?.toLowerCase().includes('returned');
                        if (!isReturn) return false;
                      } else if (logCategoryFilter === 'account') {
                        const isAccount =
                          log.action?.toLowerCase().includes('user') ||
                          log.action?.toLowerCase().includes('account') ||
                          log.action?.toLowerCase().includes('role') ||
                          log.action?.toLowerCase().includes('sign') ||
                          log.action?.toLowerCase().includes('login') ||
                          log.action?.toLowerCase().includes('logout') ||
                          log.details?.toLowerCase().includes('account') ||
                          log.details?.toLowerCase().includes('registration') ||
                          log.details?.toLowerCase().includes('signed in') ||
                          log.details?.toLowerCase().includes('signed out') ||
                          log.details?.toLowerCase().includes('role');
                        if (!isAccount) return false;
                      } else if (logCategoryFilter === 'inventory') {
                        const isItem =
                          log.action?.toLowerCase().includes('item') ||
                          log.details?.toLowerCase().includes('component') ||
                          log.details?.toLowerCase().includes('inventory');
                        if (!isItem) return false;
                      }

                      // Search query filter
                      if (logSearch.trim()) {
                        const q = logSearch.toLowerCase().trim();
                        const matches =
                          (log.user_name && log.user_name.toLowerCase().includes(q)) ||
                          (log.details && log.details.toLowerCase().includes(q)) ||
                          (log.action && log.action.toLowerCase().includes(q));
                        if (!matches) return false;
                      }

                      return true;
                    });

                    if (filteredLogs.length === 0) {
                      return (
                        <div className="py-16 text-center rounded-2xl bg-[#14141c]/60 border border-zinc-800 space-y-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400/70 mx-auto" />
                          <p className="text-sm font-bold text-white">No Activities Match Filter</p>
                          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                            No logs found within the selected timeframe ({logDaysFilter.toUpperCase()}) or search criteria.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <div className="text-[11px] text-zinc-500 font-mono pb-1 flex items-center justify-between">
                          <span>Showing {filteredLogs.length} events logged in chronological timeline</span>
                          <span className="hidden sm:inline">Real-time Activity Feed</span>
                        </div>

                        <div className="rounded-2xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-zinc-800/90 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden shadow-sm">
                        {filteredLogs.map((log) => {
                          const actionUpper = (log.action || '').toUpperCase();
                          const detailsLower = (log.details || '').toLowerCase();

                          let badgeClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
                          let label = log.action ? log.action.replace(/_/g, ' ') : 'Activity';
                          let ActionIcon = Clock;

                          if (
                            actionUpper === 'USER_SIGNIN' ||
                            detailsLower.includes('signed in') ||
                            detailsLower.includes('logged in')
                          ) {
                            badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                            label = 'Member Sign In';
                            ActionIcon = LogIn;
                          } else if (
                            actionUpper === 'USER_SIGNOUT' ||
                            detailsLower.includes('signed out') ||
                            detailsLower.includes('logged out')
                          ) {
                            badgeClass = 'bg-slate-500/20 text-slate-300 border-slate-500/40';
                            label = 'Member Sign Out';
                            ActionIcon = LogOut;
                          } else if (
                            actionUpper === 'ACCOUNT_REQUEST' ||
                            detailsLower.includes('registration request')
                          ) {
                            badgeClass = 'bg-blue-500/20 text-blue-700 dark:text-purple-300 border-blue-500/40';
                            label = 'Registration Request';
                            ActionIcon = UserPlus;
                          } else if (
                            actionUpper.includes('BORROW') ||
                            detailsLower.includes('requested') ||
                            detailsLower.includes('requisition')
                          ) {
                            badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                            label = 'Requisition';
                            ActionIcon = ShoppingBag;
                          } else if (
                            actionUpper.includes('APPROV') ||
                            detailsLower.includes('approved')
                          ) {
                            badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                            label = 'Approved';
                            ActionIcon = CheckCircle2;
                          } else if (
                            actionUpper.includes('REJECT') ||
                            detailsLower.includes('rejected')
                          ) {
                            badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                            label = 'Rejected';
                            ActionIcon = XCircle;
                          } else if (
                            actionUpper.includes('RETURN') ||
                            detailsLower.includes('returned')
                          ) {
                            badgeClass = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                            label = 'Returned';
                            ActionIcon = RotateCcw;
                          } else if (
                            actionUpper.includes('USER') ||
                            actionUpper.includes('ACCOUNT') ||
                            actionUpper.includes('ROLE') ||
                            detailsLower.includes('account') ||
                            detailsLower.includes('registration')
                          ) {
                            badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                            label = 'Account Operation';
                            ActionIcon = UserCheck;
                          } else if (
                            actionUpper.includes('CREATE') ||
                            detailsLower.includes('registered new component')
                          ) {
                            badgeClass = 'bg-blue-500/20 text-blue-700 dark:text-purple-300 border-blue-500/40';
                            label = 'Component Added';
                            ActionIcon = Plus;
                          } else if (
                            actionUpper.includes('DELETE') ||
                            detailsLower.includes('removed component')
                          ) {
                            badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40';
                            label = 'Component Deleted';
                            ActionIcon = Trash2;
                          }

                          // Compute relative time string
                          const logDate = new Date(log.created_at);
                          const diffMinutes = Math.floor((now - logDate.getTime()) / (60 * 1000));
                          const diffHours = Math.floor(diffMinutes / 60);
                          const diffDays = Math.floor(diffHours / 24);

                          let relativeTime = 'Just now';
                          if (diffMinutes >= 1 && diffMinutes < 60) relativeTime = `${diffMinutes}m ago`;
                          else if (diffHours >= 1 && diffHours < 24) relativeTime = `${diffHours}h ago`;
                          else if (diffDays === 1) relativeTime = 'Yesterday';
                          else if (diffDays > 1) relativeTime = `${diffDays}d ago`;

                          const { cleanSummary, meta } = parseActivityDetails(log.details);

                          return (
                            <div
                              key={log.id}
                              className="px-4 py-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-[#141420] transition-colors"
                            >
                              {/* Left: User Avatar + Action Details */}
                              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-purple-950/60 border border-blue-200 dark:border-purple-500/40 text-blue-600 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                                  {(log.user_name || 'U').charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0 space-y-0.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                                      {log.user_name || 'System Member'}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border flex items-center gap-1 ${badgeClass}`}
                                    >
                                      <ActionIcon className="w-3 h-3" />
                                      <span>{label}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug line-clamp-2">
                                    {cleanSummary}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Timestamp & Morphing Dialog Trigger */}
                              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pl-12 sm:pl-0">
                                <div className="text-left sm:text-right font-mono text-[11px]">
                                  <span className="block text-slate-800 dark:text-zinc-300 font-bold">
                                    {relativeTime}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    {logDate.toLocaleTimeString('en-GB', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>

                                {/* Morphing Dialog for Full Inspection without JSON */}
                                <MorphingDialog
                                  id={`activity-morph-${log.id}`}
                                  title={`Activity Log: ${label}`}
                                  subtitle={`Logged on ${logDate.toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}`}
                                  trigger={(open) => (
                                    <button
                                      type="button"
                                      onClick={open}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                      title="Inspect Details"
                                    >
                                      Inspect
                                    </button>
                                  )}
                                >
                                  <div className="space-y-4 text-xs">
                                    {/* User and Operation Card */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-zinc-400">Actor / Member</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{log.user_name || 'System Member'}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-zinc-400">Action Type</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${badgeClass}`}>{label}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-zinc-400">Timestamp</span>
                                        <span className="font-mono text-slate-800 dark:text-zinc-300">{logDate.toLocaleString('en-GB')}</span>
                                      </div>
                                    </div>

                                    {/* Breakdown of Record Data without raw JSON */}
                                    {meta ? (
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                          Application Record Details
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {meta.fullName && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Full Name</span>
                                              <span className="font-bold text-slate-900 dark:text-white">{meta.fullName}</span>
                                            </div>
                                          )}
                                          {meta.email && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Email Address</span>
                                              <span className="font-bold text-slate-900 dark:text-white break-all">{meta.email}</span>
                                            </div>
                                          )}
                                          {(meta.enrollmentNo || meta.enrollment_no) && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Enrollment No</span>
                                              <span className="font-bold font-mono text-slate-900 dark:text-white">{meta.enrollmentNo || meta.enrollment_no}</span>
                                            </div>
                                          )}
                                          {meta.phone && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Phone</span>
                                              <span className="font-bold font-mono text-slate-900 dark:text-white">{meta.phone}</span>
                                            </div>
                                          )}
                                          {meta.role && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Account Role</span>
                                              <span className="font-bold uppercase text-blue-600 dark:text-purple-400">{meta.role}</span>
                                            </div>
                                          )}
                                          {meta.status && (
                                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800">
                                              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Status</span>
                                              <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{meta.status}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151520] border border-slate-200 dark:border-zinc-800 space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase font-mono">Logged Description</p>
                                        <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">{cleanSummary}</p>
                                      </div>
                                    )}
                                  </div>
                                </MorphingDialog>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ============================================================== */}
              {/* SUB-TAB 3: ACCOUNT REQUESTS & APPROVAL QUEUE */}
              {/* ============================================================== */}
              {adminLogsTab === 'requests' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                    <span>New student & member accounts waiting for administrator authorization</span>
                    <button
                      type="button"
                      onClick={fetchPendingAccounts}
                      className="text-blue-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                    >
                      Refresh Queue
                    </button>
                  </div>

                  {pendingAccounts.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl bg-[#14141c]/60 border border-zinc-800/80 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mx-auto" />
                      <p className="text-sm font-bold text-white">No Pending Account Requests</p>
                      <p className="text-xs text-zinc-400">All member signups are currently approved and active.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                      {pendingAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800/90 hover:border-blue-500 dark:hover:border-purple-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                        >
                          {/* Left: Avatar & User Info */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 ring-2 ring-blue-500/30 dark:ring-purple-500/40">
                              {(account.full_name || account.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">{account.full_name || 'Member'}</span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/40 text-[10px] font-extrabold uppercase">
                                  {account.role || 'MEMBER'}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                  Pending Approval
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{account.email}</span>
                                </span>
                                {account.roll_number && (
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>{account.roll_number}</span>
                                  </span>
                                )}
                                {account.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>{account.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                            <button
                              type="button"
                              disabled={processingUserId === account.id}
                              onClick={() => handleRejectAccount(account.id, account.full_name || account.email)}
                              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300 dark:bg-red-950/40 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Reject</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingUserId === account.id}
                              onClick={() => handleApproveAccount(account.id, account.full_name || account.email)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/25 dark:shadow-purple-950/40 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{processingUserId === account.id ? 'Approving...' : 'Approve Account'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0f0f15] border border-zinc-800 rounded-3xl space-y-3 shadow-xl">
              <ScrollText className="w-12 h-12 text-rose-500/80 mx-auto" />
              <h3 className="text-lg font-bold text-white">Administrator Clearance Required</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Lab audit, member management, and registration logs are restricted to CICR executive administrator accounts only.
              </p>
            </div>
          )
        )}

        {/* ============================================================== */}
        {/* VIEW 6: MEET THE DEVELOPERS (Card 3 in Screenshot 1) */}
        {/* ============================================================== */}
        {activeView === 'developers' && <MeetTheDevelopers />}

        {/* ============================================================== */}
        {/* VIEW 7: MY PROFILE */}
        {/* ============================================================== */}
        {activeView === 'profile' && (
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f15] border-2 border-slate-200 dark:border-[#20202c] space-y-6 shadow-sm">
            <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-purple-400" />
                  Operator Profile Details
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage your verified student identity and laboratory credentials
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/40 text-xs font-extrabold uppercase">
                {roleName}
              </span>
            </div>

            {/* Avatar Circle Display with Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 sm:p-5 rounded-2xl bg-[#14141c] border border-zinc-800">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 dark:bg-purple-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-2 ring-blue-500/30 dark:ring-purple-500/40 overflow-hidden">
                  {editAvatarUrl ? (
                    <img src={editAvatarUrl} alt={editName || userName} className="w-full h-full object-cover" />
                  ) : (
                    (editName || userName || 'U').charAt(0).toUpperCase()
                  )}
                </div>

                {/* Hover overlay to change avatar */}
                <button
                  type="button"
                  onClick={() => profileFileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  title="Upload profile photo"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Change</span>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-base sm:text-lg font-bold text-white block truncate">{editName || userName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-purple-500/20 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-500/30 text-[10px] font-bold uppercase">
                    {roleName}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 block font-mono mt-0.5 truncate">{user?.email}</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Club Account</span>
                </span>

                {/* Upload / Remove Buttons */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <input
                    ref={profileFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileAvatarChange}
                    className="hidden"
                  />
                  <div className="w-full sm:w-auto">
                    <AnimatedFileUpload
                      variant="compact"
                      multiple={false}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024}
                      maxFiles={1}
                      dropTitle={editAvatarUrl ? 'Change Photo' : 'Upload Photo'}
                      dropSubtitle="Drop picture or click to select"
                      onFilesSelected={(files) => {
                        if (files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setEditAvatarUrl(ev.target.result as string);
                          };
                          reader.readAsDataURL(files[0]);
                        }
                      }}
                      className="max-w-xs"
                    />
                  </div>
                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileAvatar}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Email ID (Read-only) */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#09090d] border border-zinc-800/60 rounded-xl text-zinc-400 outline-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Enrollment Number</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={editEnrollment}
                    onChange={(e) => setEditEnrollment(e.target.value)}
                    placeholder="e.g. 992501030399"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 7428938113"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#14141c] border-2 border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:border-purple-600 dark:focus:border-purple-500 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Laboratory Role</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    disabled
                    value={roleName}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 dark:bg-[#09090d] border-2 border-slate-200 dark:border-zinc-800/60 rounded-xl text-blue-700 dark:text-purple-300 font-bold outline-none cursor-not-allowed uppercase font-mono tracking-wider"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(true)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-auth-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Modern Bottom Docked Navbar with Vault Index Dropup */}
      <BottomNavbar
        activeView={activeView}
        setActiveView={setActiveView}
        activeCategory={categoryFilter}
        onSelectCategory={(cat) => setCategoryFilter(cat)}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
        pendingAccountsCount={pendingAccounts.length}
      />

      {/* Modals */}
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
        onClose={() => setAddItemModalOpen(false)}
        initialItem={editingItem}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onBorrow={(i) => {
          handleAddToCart(i);
          setSelectedItem(null);
        }}
      />

    </div>
  );
};
