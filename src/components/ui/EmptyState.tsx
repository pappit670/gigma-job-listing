// Empty state component for Gigma
// Every empty state has personality — not just grey placeholder text

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { scaleIn } from '@/lib/motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div
      {...scaleIn}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.05 }}
        className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300"
      >
        {icon}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-semibold text-gray-700 mb-1"
      >
        {title}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-gray-400 mb-5"
      >
        {subtitle}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
