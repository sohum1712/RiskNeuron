import React, { useState } from 'react';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const font = {
  display: "'Barlow', sans-serif",
  label: "'Space Grotesk', sans-serif",
};

interface DisruptionEvent {
  id: number;
  disruption_type: string;
  severity: string;
  city: string;
}

interface DisruptionAlertProps {
  disruptions: DisruptionEvent[];
}

export const DisruptionAlert: React.FC<DisruptionAlertProps> = ({ disruptions }) => {
  const [dismissed, setDismissed] = useState(false);
  if (disruptions.length === 0 || dismissed) return null;

  const disruption = disruptions[0];
  const isExtreme = disruption.severity === 'extreme' || disruption.severity === 'severe';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className={`w-full rounded-2xl p-4 relative overflow-hidden border ${
          isExtreme
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`p-2 rounded-xl ${isExtreme ? 'bg-red-500/20' : 'bg-amber-500/20'}`}
            >
              <AlertTriangle className={`w-5 h-5 ${isExtreme ? 'text-red-400' : 'text-amber-400'}`} />
            </motion.div>

            <div>
              <p className="text-sm font-black text-white/90 uppercase tracking-wide" style={{ fontFamily: font.display }}>
                {disruption.disruption_type.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: font.label }}>
                {disruption.severity.toUpperCase()} · {disruption.city} · Claim auto-processing
              </p>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-[#5690FF]"
              />
              <span className="text-[10px] font-black text-[#5690FF] uppercase tracking-widest" style={{ fontFamily: font.label }}>
                Live
              </span>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/30 hover:text-white/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
