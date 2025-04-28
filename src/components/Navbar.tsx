
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import PrimaryButton from './buttons/PrimaryButton';
import AuthModal from './auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const openLoginModal = () => {
    setAuthType('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthType('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return '';
    
    // Try to get initials from the metadata if available
    const metadata = user.user_metadata;
    const fullName = metadata?.full_name || '';
    
    if (fullName) {
      return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    
    // Fallback to the first letter of the email
    return user.email ? user.email[0].toUpperCase() : 'U';
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-donezo-blue font-bold text-2xl flex items-center">
                Done<span className="text-donezo-teal">zo</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/how-it-works" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                How It Works
              </Link>
              <Link to="/services" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Services
              </Link>
              <Link to="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                About
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {!loading && !user ? (
              <>
                <PrimaryButton 
                  variant="outline" 
                  size="sm"
                  onClick={openLoginModal}
                >
                  Log In
                </PrimaryButton>
                <PrimaryButton 
                  onClick={openSignupModal}
                  size="sm"
                >
                  Sign Up
                </PrimaryButton>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-donezo-blue text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden md:inline-block">
                      {user?.user_metadata?.full_name || user?.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-donezo-blue"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden animate-slide-up">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/how-it-works" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/services" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/about" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {!loading && !user ? (
              <div className="mt-4 space-y-2 px-3">
                <PrimaryButton 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => {
                    openLoginModal();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log In
                </PrimaryButton>
                <PrimaryButton 
                  className="w-full justify-center"
                  onClick={() => {
                    openSignupModal();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </PrimaryButton>
              </div>
            ) : (
              <div className="mt-4 space-y-2 px-3">
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-base font-medium text-gray-600 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2 text-base font-medium text-gray-600 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <PrimaryButton 
                  variant="outline" 
                  className="w-full justify-center mt-2"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authType} 
      />
    </nav>
  );
};

export default Navbar;
