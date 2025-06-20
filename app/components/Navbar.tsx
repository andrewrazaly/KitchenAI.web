'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const mainNavigation = [
  { name: 'Discover', href: '/recipes' },
  { name: 'Meal Planner', href: '/meal-planner' },
  { name: 'Shopping', href: '/shopping-list' },
  { name: 'Inventory', href: '/inventory' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/sign')) {
    return null;
  }

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="hidden sm:block">KitchenAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  <UserCircleIcon className="w-6 h-6 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-700 max-w-32 truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDownIcon 
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-20">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <hr className="my-2 border-neutral-200" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-neutral-600" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <nav className="space-y-1" role="navigation">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Section */}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              {isSignedIn ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <Link
                    href="/auth/signin"
                    className="btn btn-primary w-full justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 