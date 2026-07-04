import React from 'react';
import { motion } from 'motion/react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  activeColor?: string; // Tailwind class like "bg-blue-500" or "bg-indigo-600"
  icon?: React.ReactNode;
  id?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  activeColor = 'bg-blue-500',
  icon,
  id = 'toggle-switch'
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 font-sans" id={`${id}-container`}>
      {label && (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            {icon && <span className="text-gray-500">{icon}</span>}
            {label}
          </span>
          {description && (
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed max-w-[280px]">
              {description}
            </p>
          )}
        </div>
      )}
      
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? activeColor : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span className="sr-only">Toggle</span>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
