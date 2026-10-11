import { Check } from 'lucide-react';
import type { JobStatus } from '@/types';

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = {
    ready: {
      label: 'Ready',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    'in-progress': {
      label: 'In Progress',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      dotColor: 'bg-orange-500',
    },
    busy: {
      label: 'Busy',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
    },
    completed: {
      label: 'Completed',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
    },
  };

  const { label, bgColor, textColor, dotColor } = config[status];

  if (status === 'completed') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        <Check className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
