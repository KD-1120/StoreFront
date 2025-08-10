import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Search, ShoppingBag, Menu, User, Heart, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onAuthClick?: () => void;
  user: any;
  storeName?: string;
  isStorefront?: boolean;
  isEditable?: boolean;
  onStoreNameChange?: (newName: string) => void;
  onStoreNameChange?: (newName: string) => void;
}

export function Header({ cartItemCount, onCartClick, onAuthClick, user, storeName, isStorefront = false, isEditable = false, onStoreNameChange, collections }: HeaderProps & { collections?: { id: string; name: string }[] }) {
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {isEditable ? (
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onStoreNameChange?.(e.target.textContent || '')}
                className="text-xl font-semibold"
              >
                {storeName || 'StyleHub'}
              </h1>
            ) : (
              <h1 className="text-xl font-semibold">{storeName || 'StyleHub'}</h1>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {collections && collections.length > 0 ? (
              collections.map((col) => (
                <a key={col.id} href={`#${col.name}`} className="hover:text-primary transition-colors">
                  {col.name}
                </a>
              ))
            ) : (
              <span className="text-muted-foreground">No collections available</span>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.user_metadata?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isStorefront && onAuthClick ? (
              <Button variant="ghost" size="icon" onClick={onAuthClick} className="hidden md:flex">
                <User className="w-5 h-5" />
              </Button>
            ) : null}

            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={onCartClick} className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <nav className="flex flex-col space-y-4">
                    {collections && collections.length > 0 ? (
                      collections.map((col) => (
                        <a key={col.id} href={`#${col.name}`} className="text-lg hover:text-primary transition-colors">
                          {col.name}
                        </a>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No collections available</span>
                    )}
                  </nav>

                  {user ? (
                    <div className="space-y-4 pt-4">
                      <div className="text-sm">
                        <p className="font-medium">{user.user_metadata?.name || 'User'}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button variant="ghost" className="justify-start">
                          <Package className="mr-2 h-4 w-4" />
                          Order History
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                        </Button>
                        <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : !isStorefront && onAuthClick ? (
                    <Button onClick={onAuthClick} className="w-full">
                      Sign In / Sign Up
                    </Button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}