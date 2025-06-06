'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, BookOpenIcon, ShoppingBagIcon, UserIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from './GoogleAnalytics';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Recipes', href: '/recipes', icon: BookOpenIcon },
    { name: 'Instagram', href: '/instagram', icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ) },
    { name: 'Planner', href: '/meal-planner', icon: CalendarDaysIcon },
    { name: 'Inventory', href: '/inventory', icon: ShoppingBagIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const handleNavigation = (href: string, label: string) => {
    // Track navigation events
    trackEvent('navigation_click', 'bottom_nav', label);
    
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {/* Dashboard */}
        <button
          onClick={() => handleNavigation('/', 'Dashboard')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === '/' 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </button>

        {/* Instagram/Recipe Search */}
        <button
          onClick={() => handleNavigation('/instagram', 'Recipe Search')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === '/instagram' 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BookOpenIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Recipes</span>
        </button>

        {/* Shopping List */}
        <button
          onClick={() => handleNavigation('/shopping-list', 'Shopping Lists')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === '/shopping-list' 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShoppingBagIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Lists</span>
        </button>

        {/* Inventory */}
        <button
          onClick={() => handleNavigation('/inventory', 'Inventory')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === '/inventory' 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CalendarDaysIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Inventory</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleNavigation('/profile', 'Profile')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            pathname === '/profile' 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
} 