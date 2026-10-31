import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { InventoryItem, BorrowRequest, ActivityLog } from '../types/inventory';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  items: InventoryItem[];
  requests: BorrowRequest[];
  logs: ActivityLog[];
  loading: boolean;
  isLiveDatabase: boolean;
  schemaNeeded: boolean;
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  submitBorrowRequest: (data: {
    itemId: string;
    quantity: number;
    projectName: string;
    purpose: string;
    expectedReturnDate: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateBorrowStatus: (
    requestId: string,
    status: 'approved' | 'rejected' | 'returned',
    adminNotes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveDatabase, setIsLiveDatabase] = useState<boolean>(false);
  const [schemaNeeded, setSchemaNeeded] = useState<boolean>(false);

  // Fetch real data from Supabase backend
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch real inventory items from Supabase
      const { data: dbItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemsError) {
        if (itemsError.code === 'PGRST205' || itemsError.message.includes('not find the table')) {
          setSchemaNeeded(true);
          setIsLiveDatabase(false);
          setItems([]);
        } else {
          setItems([]);
        }
      } else if (dbItems) {
        setIsLiveDatabase(true);
        setSchemaNeeded(false);
        const normalizedItems: InventoryItem[] = (dbItems as any[]).map((item) => ({
          ...item,
          total_qty: Number(item.total_qty ?? item.quantity ?? 1),
          available_qty: Number(item.available_qty ?? item.available_quantity ?? item.total_qty ?? item.quantity ?? 1),
        }));
        setItems(normalizedItems);

        // 2. Fetch real borrow requests from Supabase
        const { data: dbRequests } = await supabaseAdmin
          .from('borrow_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbRequests) {
          setRequests(dbRequests as BorrowRequest[]);
        }

        // 3. Fetch real activity logs (full multi-day audit history via supabaseAdmin)
        const { data: dbLogs } = await supabaseAdmin
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(250);

        if (dbLogs) {
          setLogs(dbLogs as ActivityLog[]);
        }
      }
    } catch {
      setItems([]);
      setRequests([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      refreshData();
    }, 1500);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Real Add Item in Supabase
  const addItem = async (newItemData: Omit<InventoryItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([newItemData])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      if (data) {
        setItems((prev) => [data as InventoryItem, ...prev]);
        try {
          await supabaseAdmin.from('activity_logs').insert([
            {
              user_id: user?.id,
              user_name: profile?.full_name || user?.email || 'Admin',
              action: 'CREATE_ITEM',
              details: `Registered new component "${newItemData.name}" (${newItemData.category})`,
            },
          ]);
        } catch {
          // ignore
        }
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { success: false, error: msg };
    }
  };

  // Real Update Item in Supabase
  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database update failed';
      return { success: false, error: msg };
    }
  };

  // Real Delete Item in Supabase
  const deleteItem = async (id: string) => {
    try {
      const targetItem = items.find((i) => i.id === id);
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await supabase.from('activity_logs').insert([
          {
            user_id: user?.id,
            user_name: profile?.full_name || user?.email || 'Admin',
            action: 'DELETE_ITEM',
            details: `Removed component "${targetItem?.name || id}" from vault inventory`,
          },
        ]);
      } catch {
        // ignore
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete from DB';
      return { success: false, error: msg };
    }
  };

  // Real Submit Borrow Request
  const submitBorrowRequest = async (data: {
    itemId: string;
    quantity: number;
    projectName: string;
    purpose: string;
    expectedReturnDate: string;
  }) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return { success: false, error: 'Item not found' };
    if (item.available_qty < data.quantity) {
      return { success: false, error: `Only ${item.available_qty} items available in stock` };
    }

    try {
      const { data: dbData, error } = await supabaseAdmin
        .from('borrow_requests')
        .insert([
          {
            item_id: item.id,
            user_id: user?.id,
            user_name: profile?.full_name || user?.email || 'Student Member',
            user_email: profile?.email || user?.email,
            item_name: item.name,
            quantity: data.quantity,
            project_name: data.projectName,
            purpose: data.purpose,
            status: 'pending',
            expected_return_date: data.expectedReturnDate,
          },
        ])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      if (dbData) {
        setRequests((prev) => [dbData as BorrowRequest, ...prev]);
        try {
          await supabaseAdmin.from('activity_logs').insert([
            {
              user_id: user?.id,
              user_name: profile?.full_name || user?.email || 'Member',
              action: 'BORROW_REQUEST',
              details: `Requested ${data.quantity}x ${item.name} for "${data.projectName}"`,
            },
          ]);
        } catch {
          // ignore
        }
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database request failed';
      return { success: false, error: msg };
    }
  };

  // Real Update Borrow Status with full backend inventory quantity adjustments
  const updateBorrowStatus = async (
    requestId: string,
    newStatus: 'approved' | 'rejected' | 'returned',
    adminNotes?: string
  ) => {
    try {
      const targetReq = requests.find((r) => r.id === requestId);

      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        approved_by: profile?.full_name || 'Admin',
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'approved') {
        updatePayload.borrow_date = new Date().toISOString().split('T')[0];
        
        // Decrement available quantity in Supabase backend via supabaseAdmin
        if (targetReq) {
          const targetItem = items.find((i) => i.id === targetReq.item_id);
          if (targetItem) {
            const newAvail = Math.max(0, targetItem.available_qty - targetReq.quantity);
            const statusLabel =
              newAvail <= 0
                ? 'Out of Stock'
                : targetItem.total_qty > 0 && (newAvail / targetItem.total_qty) < 0.5
                ? 'Low Stock'
                : 'In Stock';

            await supabaseAdmin
              .from('inventory_items')
              .update({
                available_qty: newAvail,
                status: statusLabel,
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetItem.id);

            // Immediately update local items state
            setItems((prev) =>
              prev.map((it) =>
                it.id === targetItem.id
                  ? { ...it, available_qty: newAvail, status: statusLabel }
                  : it
              )
            );
          }
        }
      } else if (newStatus === 'returned') {
        updatePayload.actual_return_date = new Date().toISOString().split('T')[0];

        // Increment available quantity back in Supabase backend via supabaseAdmin
        if (targetReq) {
          const targetItem = items.find((i) => i.id === targetReq.item_id);
          if (targetItem) {
            const newAvail = Math.min(targetItem.total_qty, targetItem.available_qty + targetReq.quantity);
            const statusLabel =
              newAvail <= 0
                ? 'Out of Stock'
                : targetItem.total_qty > 0 && (newAvail / targetItem.total_qty) < 0.5
                ? 'Low Stock'
                : 'In Stock';

            await supabaseAdmin
              .from('inventory_items')
              .update({
                available_qty: newAvail,
                status: statusLabel,
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetItem.id);

            // Immediately update local items state
            setItems((prev) =>
              prev.map((it) =>
                it.id === targetItem.id
                  ? { ...it, available_qty: newAvail, status: statusLabel }
                  : it
              )
            );
          }
        }
      }

      // Update borrow request in Supabase via supabaseAdmin
      const { error } = await supabaseAdmin
        .from('borrow_requests')
        .update(updatePayload)
        .eq('id', requestId);

      if (error) return { success: false, error: error.message };

      // Immediately update local requests state
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...updatePayload, status: newStatus } : r))
      );

      // Log activity in Supabase
      if (targetReq) {
        await supabaseAdmin.from('activity_logs').insert([
          {
            user_id: user?.id,
            user_name: profile?.full_name || 'Admin',
            action: newStatus,
            target_type: 'borrow_request',
            target_id: requestId,
            details: `${targetReq.item_name} marked as ${newStatus} (x${targetReq.quantity})`,
          },
        ]);
      }

      await refreshData();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update request';
      return { success: false, error: msg };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        requests,
        logs,
        loading,
        isLiveDatabase,
        schemaNeeded,
        addItem,
        updateItem,
        deleteItem,
        submitBorrowRequest,
        updateBorrowStatus,
        refreshData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
