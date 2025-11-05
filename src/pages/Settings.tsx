import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Sun,
  Type,
  Zap,
  Volume2,
  Accessibility,
  User,
  Bell,
  LogOut,
  Palette,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTheme, themes } from '@/contexts/ThemeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppStore();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, isDark, toggleDark } = useTheme();

  const fontSizes = [
    { value: 'small' as const, label: 'Small', className: 'text-sm' },
    { value: 'medium' as const, label: 'Medium', className: 'text-base' },
    { value: 'large' as const, label: 'Large', className: 'text-lg' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 bg-card"
      >
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <EnhancedButton
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </EnhancedButton>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Theme & Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-calm p-2">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Theme & Appearance
                </h2>
              </div>

              <div className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={isDark}
                    onCheckedChange={toggleDark}
                  />
                </div>

                {/* Color Theme Selection */}
                <div className="space-y-3">
                  <Label className="text-base">Color theme</Label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(Object.keys(themes) as Array<keyof typeof themes>).map((themeKey) => {
                      const themeData = themes[themeKey];
                      const colors = themeData[isDark ? 'dark' : 'light'];
                      return (
                        <button
                          key={themeKey}
                          onClick={() => setTheme(themeKey)}
                          className={cn(
                            'group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all',
                            theme === themeKey
                              ? 'border-primary bg-gradient-calm ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-muted'
                          )}
                        >
                          <div className="mb-2 flex justify-center gap-1">
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: `hsl(${colors.primary})` }}
                            />
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: `hsl(${colors.secondary})` }}
                            />
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: `hsl(${colors.accent})` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {themeData.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Accessibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-calm p-2">
                  <Accessibility className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Accessibility
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion" className="text-base">
                      Reduced motion
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) =>
                      updateSettings({ reducedMotion: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dyslexia-font" className="text-base">
                      Dyslexia-friendly font
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use specially designed font for easier reading
                    </p>
                  </div>
                  <Switch
                    id="dyslexia-font"
                    checked={settings.dyslexiaFont}
                    onCheckedChange={(checked) =>
                      updateSettings({ dyslexiaFont: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Text size</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => updateSettings({ fontSize: size.value })}
                        className={cn(
                          'rounded-xl border-2 p-3 text-center transition-all',
                          settings.fontSize === size.value
                            ? 'border-primary bg-gradient-calm'
                            : 'border-border hover:border-primary/50 hover:bg-muted'
                        )}
                      >
                        <Type className="mx-auto mb-1 h-5 w-5" />
                        <span className={cn('font-medium', size.className)}>
                          {size.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Learning Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-calm p-2">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Learning
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-hints" className="text-base">
                      Show hints
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get gradual guidance when solving problems
                    </p>
                  </div>
                  <Switch
                    id="use-hints"
                    checked={settings.useHints}
                    onCheckedChange={(checked) =>
                      updateSettings({ useHints: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-calm p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Account
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.email || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Grade
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {settings.grade ? `Grade ${settings.grade}` : 'Not set'}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Favorite Chapters
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {settings.favoriteChapters && settings.favoriteChapters.length > 0 
                      ? settings.favoriteChapters.join(', ') 
                      : 'None selected'}
                  </p>
                </div>

                <EnhancedButton
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/onboarding')}
                >
                  Update preferences
                </EnhancedButton>

                <EnhancedButton
                  variant="outline"
                  className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </EnhancedButton>
              </div>
            </Card>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-accent/30 bg-gradient-card p-6 text-center">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Saesha v1.0.0
              </p>
              <p className="text-sm text-muted-foreground">
                Designed with care for focused, ADHD-friendly learning
              </p>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
