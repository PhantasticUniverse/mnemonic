import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { QuickAddModal } from '@/components/cards/QuickAddModal';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCardStore } from '@/stores/card-store';
import { Home, BookOpen, FolderTree, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Layout() {
  const { loadDueCounts } = useCardStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onQuickAdd: () => setShowAddModal(true),
  });

  // Load due counts periodically
  React.useEffect(() => {
    loadDueCounts();
    const interval = setInterval(loadDueCounts, 60000); // Every minute
    return () => clearInterval(interval);
  }, [loadDueCounts]);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  // Initialize dark mode from localStorage
  React.useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center px-6 gap-6">
          {/* Logo */}
          <NavLink to="/" className="font-serif text-xl font-semibold text-primary">
            Mnemonic
          </NavLink>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Home" />
            <NavItem to="/cards" icon={<BookOpen className="h-4 w-4" />} label="Cards" />
            <NavItem to="/topics" icon={<FolderTree className="h-4 w-4" />} label="Topics" />
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="hidden md:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
              <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )
      }
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );
}
