'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  ArchiveBoxIcon,
  UserCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid, 
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  BookOpenIcon as BookOpenIconSolid
} from '@heroicons/react/24/solid';
import { trackEvent } from './GoogleAnalytics';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  ariaLabel: string;
}

const navigation: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    label: 'Home',
    ariaLabel: 'Go to home dashboard'
  },
  {
    name: 'Explore',
    href: '/explore',
    icon: MagnifyingGlassIcon,
    iconSolid: MagnifyingGlassIconSolid,
    label: 'Explore',
    ariaLabel: 'Explore recipe creators and content'
  },
  {
    name: 'Recipes',
    href: '/recipes',
    icon: BookOpenIcon,
    iconSolid: BookOpenIconSolid,
    label: 'Recipes',
    ariaLabel: 'View saved recipes'
  },
  {
    name: 'Shopping',
    href: '/shopping-list',
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
    label: 'Shopping',
    ariaLabel: 'View shopping lists'
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: ArchiveBoxIcon,
    iconSolid: ArchiveBoxIconSolid,
    label: 'Inventory',
    ariaLabel: 'Manage food inventory'
  }
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigation = (item: NavItem) => {
    trackEvent('navigation_click', 'bottom_nav', item.name);
  };

  // Don't show bottom nav on auth pages
  if (isClient && (pathname?.startsWith('/auth') || pathname?.startsWith('/sign'))) {
    return null;
  }

  // Show consistent loading state until client is ready
  if (!isClient) {
    return (
      <nav className="bottom-nav safe-bottom">
        <div className="flex justify-around items-center h-full px-2">
          {navigation.map((item) => (
            <div key={item.name} className="bottom-nav-item">
              <div className="w-6 h-6 bg-neutral-200 animate-pulse rounded" />
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="bottom-nav safe-bottom"
      role="navigation"
      aria-label="Main navigation"
      suppressHydrationWarning
    >
      <div className="flex justify-around items-center h-full px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href));
          
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavigation(item)}
              className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="bottom-nav-icon" aria-hidden="true" />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 