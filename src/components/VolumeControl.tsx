import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { EnhancedButton } from './ui/enhanced-button';

export function VolumeControl() {
  const { settings, updateSettings } = useAppStore();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <EnhancedButton
        variant="outline"
        size="icon"
        onClick={toggleSound}
        className={`
          w-14 h-14 rounded-full shadow-xl
          ${settings.soundEnabled 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-muted text-muted-foreground'
          }
        `}
        aria-label={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        <motion.div
          key={settings.soundEnabled ? 'on' : 'off'}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </motion.div>
      </EnhancedButton>
      
      {/* Sound waves animation when enabled */}
      {settings.soundEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{
                duration: 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
