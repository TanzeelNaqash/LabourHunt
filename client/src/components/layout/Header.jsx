import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

import { useState } from "react";
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // Helper functions for user display
  const getUserImage = () => {
    if (worker) return worker.photo;
    if (admin) {
      // Return admin photo or a default placeholder
      return admin.photo || 'https://via.placeholder.com/150x150?text=Admin';
    }
    return user?.profileImage;
  };

  const getUserName = () => {
    if (worker) return worker.username;
    if (admin) return admin.username;
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';
  };

  const getUserInitials = () => {
    if (worker) return worker.username?.[0] || 'W';
    if (admin) return admin.username?.[0] || 'A';
    return (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || 'U';
  };

  const getUserEmail = () => {
    if (admin) return admin.email;
    return user?.email;
  };

  const getDashboardLink = () => {
    if (worker) return '/worker-dashboard';
    if (admin) return '/admin-dashboard';
    return '/client-dashboard';
  };

  const getDashboardName = () => {
    if (worker) return 'Worker Dashboard';
    if (admin) return 'Admin Dashboard';
    return 'Client Dashboard';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" onClick={scrollToTop}>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary">LabourHunt</span>
                <img src="/logo.svg" alt="LabourHunt" className="h-6 w-6" />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" onClick={scrollToTop}>
              <div className="text-neutral-700 hover:text-primary font-medium transition-colors">
                Home
              </div>
            </Link>
            <Link href="/how-it-works" onClick={scrollToTop}>
              <div className="text-neutral-700 hover:text-primary font-medium transition-colors">
                How it Works
              </div>
            </Link>
            <Link href="/workers" onClick={scrollToTop}>
              <div className="text-neutral-700 hover:text-primary font-medium transition-colors">
                Find Workers
              </div>
            </Link>
            <Link href="/about" onClick={scrollToTop}>
              <div className="text-neutral-700 hover:text-primary font-medium transition-colors">
                About
              </div>
            </Link>
          </nav>
          
          {/* Auth/Profile Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (worker || user || admin) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar>
                      <AvatarImage 
                        src={getUserImage()} 
                        alt={getUserName()} 
                      />
                      <AvatarFallback>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-100 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={getUserImage()} 
                        alt={getUserName()} 
                      />
                      <AvatarFallback>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">
                        {getUserName()}
                      </div>
                      {(user || admin) && !worker && <div className="text-xs text-gray-500">{getUserEmail()}</div>}
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/10">
                    <Link href={getDashboardLink()}>{getDashboardName()}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" onClick={scrollToTop}>
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/auth" onClick={scrollToTop}>
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
           
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu} 
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" onClick={scrollToTop}>
                <div 
                  className="text-neutral-700 hover:text-primary font-medium transition-colors" 
                  onClick={closeMenu}
                >
                  Home
                </div>
              </Link>
              <Link href="/how-it-works" onClick={scrollToTop}>
                <div 
                  className="text-neutral-700 hover:text-primary font-medium transition-colors" 
                  onClick={closeMenu}
                >
                  How it Works
                </div>
              </Link>
              <Link href="/workers" onClick={scrollToTop}>
                <div 
                  className="text-neutral-700 hover:text-primary font-medium transition-colors" 
                  onClick={closeMenu}
                >
                  Find Workers
                </div>
              </Link>
              <Link href="/about" onClick={scrollToTop}>
                <div 
                  className="text-neutral-700 hover:text-primary font-medium transition-colors" 
                  onClick={closeMenu}
                >
                  About
                </div>
              </Link>
            </nav>
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                {isAuthenticated && (worker || user || admin) ? (
                  <div className="flex flex-col items-start gap-3 p-3 rounded-lg bg-gray-50 border mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getUserImage()} 
                          alt={getUserName()} 
                        />
                        <AvatarFallback>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-base">
                          {getUserName()}
                        </div>
                        {(user || admin) && !worker && <div className="text-xs text-gray-500">{getUserEmail()}</div>}
                      </div>
                    </div>
                    <Link href={getDashboardLink()} onClick={closeMenu} className="w-full">
                      <Button className="w-full" variant="outline">{getDashboardName()}</Button>
                    </Link>
                    <Button className="w-full" variant="destructive" onClick={() => { handleLogout(); closeMenu(); }}>Logout</Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" onClick={scrollToTop}>
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={closeMenu}
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={scrollToTop}>
                      <Button 
                        className="w-full" 
                        onClick={closeMenu}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 