'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  action?: () => void;
}

export interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showCount?: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen: controlledIsOpen,
  onOpenChange,
  showCount = true,
  className,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPanelOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setPanelOpen = useCallback(
    (open: boolean) => {
      if (onOpenChange) onOpenChange(open);
      else setInternalIsOpen(open);
    },
    [onOpenChange]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const prevCountRef = useRef(unreadCount);

  // Trigger subtle bell shake when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Click outside to close panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    if (isPanelOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isPanelOpen, setPanelOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Bell Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setPanelOpen(!isPanelOpen)}
        animate={
          isShaking
            ? {
                rotate: [0, -12, 10, -8, 6, -2, 0],
              }
            : {}
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isPanelOpen}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : 'Notifications'
        }
        className={cn(
          'relative p-2 sm:p-2.5 rounded-full border-2 transition-all focus-visible:outline-none cursor-pointer',
          isPanelOpen
            ? 'bg-blue-50 border-blue-600 dark:border-purple-600 text-blue-600 dark:text-purple-400 dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-300'
            : 'bg-slate-100 dark:bg-[#151520] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700'
        )}
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

        {/* Unread Badge / Red Dot */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={motionTransitions.springSnappy}
              className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-600 text-white font-mono font-black border-2 border-white dark:border-[#0f0f16]',
                showCount
                  ? 'min-w-[18px] h-[18px] px-1 text-[10px]'
                  : 'w-2.5 h-2.5'
              )}
            >
              {showCount && (unreadCount > 99 ? '99+' : unreadCount)}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Notification Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={motionTransitions.springSnappy}
            className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[calc(100vw-3rem)] max-w-[340px] sm:max-w-none sm:w-96 rounded-3xl bg-white/98 dark:bg-[#0c0c14]/98 backdrop-blur-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-2xl shadow-slate-900/15 dark:shadow-black z-50 overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#12121c]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-mono font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="p-1 px-2 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-400 dark:text-zinc-400 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
              {notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-400">No notifications right now</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((item) => {
                  const dateString =
                    typeof item.timestamp === 'string'
                      ? new Date(item.timestamp).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : item.timestamp.toLocaleDateString();

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        'p-3.5 flex items-start gap-3 transition-colors text-xs cursor-pointer',
                        item.read
                          ? 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                          : 'bg-blue-50/50 dark:bg-purple-950/20 hover:bg-blue-50 dark:hover:bg-purple-950/30'
                      )}
                      onClick={() => {
                        if (!item.read) onMarkAsRead(item.id);
                        if (item.action) {
                          item.action();
                          setPanelOpen(false);
                        }
                      }}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full mt-1.5 shrink-0',
                          item.read ? 'bg-transparent' : 'bg-red-600 animate-pulse'
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs leading-relaxed', item.read ? 'text-slate-600 dark:text-zinc-400 font-normal' : 'text-slate-900 dark:text-white font-bold')}>
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {dateString}
                          </span>
                          {item.action && (
                            <span className="text-[10px] text-blue-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                          title="Mark as read"
                          aria-label="Mark notification as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
