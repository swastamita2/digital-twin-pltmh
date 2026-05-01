"use client";

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  type: string;
  message: string;
}

export default function AlertBanner({ type, message }: Props) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse',
  };

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    danger: <XCircle className="w-5 h-5 text-rose-500" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type] || styles.warning} shadow-sm transition-all`}>
      <div className="shrink-0 mt-0.5">{icons[type] || icons.warning}</div>
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
    </div>
  );
}
