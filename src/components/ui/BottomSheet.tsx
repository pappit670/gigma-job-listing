// Reusable animated bottom sheet for Gigma
// Replaces every modal that currently uses fixed positioning with no animation

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { backdrop, bottomSheet } from '@/lib/motion';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdrop}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            {...bottomSheet}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ maxWidth: 480, margin: '0 auto' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            {title && (
              <div className="px-5 pt-2 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            )}

            <div className="p-5 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
