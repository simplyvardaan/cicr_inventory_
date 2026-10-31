import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/inventory';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  enrollment_no?: string;
  phone?: string;
  role?: UserRole;
  avatar_url?: string;
  username?: string;
  academic_branch?: string;
}

export interface SignInData {
  identifier: string; // email, username, or enrollment number
  password: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isLeadOrAdmin: boolean;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  approveUserAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  rejectUserAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          id: data.id,
          email: data.email || currentUser.email || '',
          full_name: data.full_name || currentUser.user_metadata?.full_name || 'Member',
          username: data.username || currentUser.user_metadata?.username || '',
          enrollment_no: data.roll_number || currentUser.user_metadata?.enrollment_no || '',
          roll_number: data.roll_number || currentUser.user_metadata?.enrollment_no || '',
          role: (data.role as UserRole) || (currentUser.user_metadata?.role as UserRole) || 'member',
          phone: data.phone || currentUser.user_metadata?.phone || '',
          avatar_url: data.avatar_url && !data.avatar_url.startsWith('status:') ? data.avatar_url : (currentUser.user_metadata?.avatar_url || ''),
          created_at: data.created_at || currentUser.created_at,
          last_sign_in: currentUser.last_sign_in_at,
        });
        return;
      }
    } catch {
      // ignore
    }

    const meta = currentUser.user_metadata || {};
    const fallbackProfile: UserProfile = {
      id: currentUser.id,
      email: currentUser.email || '',
      full_name: meta.full_name || currentUser.email?.split('@')[0] || 'Member',
      username: meta.username || '',
      enrollment_no: meta.enrollment_no || meta.roll_number || '',
      roll_number: meta.enrollment_no || meta.roll_number || '',
      role: (meta.role as UserRole) || 'member',
      phone: meta.phone || '',
      avatar_url: meta.avatar_url || '',
      created_at: currentUser.created_at,
      last_sign_in: currentUser.last_sign_in_at,
    };
    setProfile(fallbackProfile);
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ identifier, password }: SignInData) => {
    try {
      let emailToAuth = identifier.trim();

      if (!emailToAuth.includes('@')) {
        emailToAuth = `${emailToAuth.toLowerCase()}@mail.jiit.ac.in`;
      }

      let res = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });

      // Handle unconfirmed email automatically using service role admin
      if (res.error && res.error.message.toLowerCase().includes('not confirmed')) {
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const target = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === emailToAuth.toLowerCase()
          );
          if (target) {
            await supabaseAdmin.auth.admin.updateUserById(target.id, {
              email_confirm: true,
            });
            // Retry login now that email is confirmed!
            res = await supabase.auth.signInWithPassword({
              email: emailToAuth,
              password,
            });
          }
        } catch (adminErr) {
          console.warn('Auto-confirm attempt error:', adminErr);
        }
      }

      if (res.error) {
        return { success: false, error: res.error.message };
      }

      if (res.data.user) {
        // Fetch user profile from database to determine dynamic role and approval status
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', res.data.user.id)
          .maybeSingle();

        // Check Admin status dynamically from database role or metadata (NO hardcoded email)
        const isUserAdmin =
          profData?.role === 'admin' ||
          res.data.user.user_metadata?.role === 'admin';

        const userStatus =
          profData?.avatar_url === 'status:pending'
            ? 'pending'
            : profData?.avatar_url === 'status:rejected'
            ? 'rejected'
            : res.data.user.user_metadata?.status || 'approved';

        if (!isUserAdmin && userStatus === 'pending') {
          await supabase.auth.signOut();
          return {
            success: false,
            error:
              'Your account registration is pending Admin Approval. Please wait for an administrator to review and approve your account in Admin Logs before logging in.',
          };
        }

        if (!isUserAdmin && userStatus === 'rejected') {
          await supabase.auth.signOut();
          return {
            success: false,
            error:
              'Your account registration request was rejected by the administrator. Please contact club leadership.',
          };
        }

        setUser(res.data.user);
        setSession(res.data.session);
        await loadProfile(res.data.user);
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  const signUp = async ({
    email,
    password,
    full_name,
    enrollment_no = '',
    phone = '',
    role = 'member',
    avatar_url = '',
  }: SignUpData) => {
    try {
      let emailToRegister = email.trim();
      if (!emailToRegister.includes('@')) {
        emailToRegister = `${emailToRegister.toLowerCase()}@mail.jiit.ac.in`;
      }

      const initialStatus = 'pending';

      // 1. Create user in Supabase Auth
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: emailToRegister,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          enrollment_no,
          phone,
          role,
          status: initialStatus,
          avatar_url: avatar_url || undefined,
        },
      });

      if (adminError) {
        return { success: false, error: adminError.message };
      }

      if (adminUser?.user) {
        // 2. Insert to profiles table
        try {
          await supabase.from('profiles').upsert([
            {
              id: adminUser.user.id,
              full_name,
              email: emailToRegister,
              role,
              roll_number: enrollment_no,
              phone,
              avatar_url: avatar_url || `status:${initialStatus}`,
            },
          ]);
        } catch (profileErr) {
          console.warn('Profile insert warning:', profileErr);
        }

        // 3. Log to activity_logs for Admin portal visibility
        try {
          await supabase.from('activity_logs').insert([
            {
              user_id: adminUser.user.id,
              user_name: full_name,
              action: 'ACCOUNT_REQUEST',
              details: JSON.stringify({
                userId: adminUser.user.id,
                email: emailToRegister,
                fullName: full_name,
                enrollmentNo: enrollment_no,
                phone,
                role,
                status: initialStatus,
                avatar_url: avatar_url || undefined,
                created_at: new Date().toISOString(),
              }),
            },
          ]);
        } catch (logErr) {
          console.warn('Activity log insert warning:', logErr);
        }

        return {
          success: true,
          message:
            'Registration request submitted successfully! Your account is pending admin approval in Admin Logs before you can log in.',
        };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  const approveUserAccount = async (userId: string) => {
    try {
      // Update in Supabase Auth user_metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { status: 'approved' },
      });

      // Update in Supabase profiles table (only if avatar_url doesn't contain a real uploaded photo)
      const { data: currentProf } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (!currentProf?.avatar_url || currentProf.avatar_url === 'status:pending') {
        await supabase.from('profiles').update({ avatar_url: 'status:approved' }).eq('id', userId);
      }

      // Log action
      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          user_name: profile?.full_name || 'Admin',
          action: 'ACCOUNT_APPROVED',
          details: `Account for user ${userId} approved by ${profile?.full_name || 'Admin'}`,
        },
      ]);

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      return { success: false, error: msg };
    }
  };

  const rejectUserAccount = async (userId: string) => {
    try {
      // Update in Supabase Auth user_metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { status: 'rejected' },
      });

      // Update in Supabase profiles table
      const { data: currentProf } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (!currentProf?.avatar_url || currentProf.avatar_url.startsWith('status:')) {
        await supabase.from('profiles').update({ avatar_url: 'status:rejected' }).eq('id', userId);
      }

      // Log action
      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          user_name: profile?.full_name || 'Admin',
          action: 'ACCOUNT_REJECTED',
          details: `Account for user ${userId} rejected by ${profile?.full_name || 'Admin'}`,
        },
      ]);

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
      if (updates.roll_number !== undefined) updateData.roll_number = updates.roll_number;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      await supabase.auth.updateUser({
        data: {
          ...(updates.full_name !== undefined ? { full_name: updates.full_name } : {}),
          ...(updates.roll_number !== undefined ? { enrollment_no: updates.roll_number } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.avatar_url !== undefined ? { avatar_url: updates.avatar_url } : {}),
        },
      });

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
  const isLeadOrAdmin = isAdmin || profile?.role === 'lead';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        isLeadOrAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        approveUserAccount,
        rejectUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
