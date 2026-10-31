'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

export interface MorphingDialogProps {
  id?: string;
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const MorphingDialog: React.FC<MorphingDialogProps> = ({
  id = 'morph-dialog',
  trigger,
  title,
  subtitle,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="inline-block">
        {trigger(() => setIsOpen(true))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransitions.easeSoft}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-md"
            />

            {/* Expanded Morphing Surface */}
            <motion.div
              layoutId={id}
              transition={motionTransitions.springMorph}
              className={cn(
                'relative w-full max-w-lg rounded-3xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0918] p-6 sm:p-8 shadow-2xl shadow-slate-900/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden text-slate-900 dark:text-slate-100',
                className
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    {title}
                  </motion.h3>
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors focus-ring cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4"
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
