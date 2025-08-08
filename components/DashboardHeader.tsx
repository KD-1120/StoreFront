import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Store, ExternalLink, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateStoreUrl } from '../utils/routing';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  store: any;
  user: any;
  className?: string; // Allow custom className for styling
}

export function DashboardHeader({ store, user, className }: DashboardHeaderProps) {
  const { signOut } = useAuth();

  const handleViewStore = () => {
    if (!store.published) {
      toast.error('Please publish your store first to view it publicly');
      return;
    }
    
    const storeUrl = generateStoreUrl(store.subdomain);
    window.open(storeUrl, '_blank');
  };

  return (
    <header className={`border-b bg-background ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">StoreFront</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>/</span>
              <span>{store.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleViewStore} className="hidden sm:flex">
              <ExternalLink className="w-4 h-4 mr-2" />
              {store.published ? 'View Store' : 'Store Not Published'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.user_metadata?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewStore} className="sm:hidden">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>{store.published ? 'View Store' : 'Store Not Published'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}