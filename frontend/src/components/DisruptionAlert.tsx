import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './ui/Badge';

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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full ${
          isExtreme 
            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50' 
            : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50'
        } border rounded-lg p-4 mb-6 relative`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle className={`w-6 h-6 ${isExtreme ? 'text-red-400' : 'text-amber-400'}`} />
            </motion.div>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-100 font-semibold">
                {disruption.disruption_type.replace(/_/g, ' ').toUpperCase()}
              </span>
              <Badge variant={disruption.severity as any} size="sm">
                {disruption.severity}
              </Badge>
              <span className="text-slate-300 text-sm">
                detected in {disruption.city}
              </span>
            </div>
            
            <div className="ml-4 text-slate-300 text-sm flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 bg-cyan-400 rounded-full"
              />
              Claim auto-processing...
            </div>
          </div>
          
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
