'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user, signOut } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Meal Planner', href: '/meal-planner' },
    { name: 'Instagram', href: '/instagram' },
    { name: 'Shopping List', href: '/shopping-list' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Recipes', href: '/recipes' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold transition-colors" style={{ color: '#91c11e' }}>
                KitchenAI
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'border-b-2 text-gray-900'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  style={pathname === item.href 
                    ? { borderBottomColor: '#91c11e', color: '#3c3c3c' }
                    : { color: '#888888' }
                  }
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium" style={{ color: '#3c3c3c' }}>
                    {user?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-white border-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all hover:bg-gray-50"
                    style={{ borderColor: '#91c11e', color: '#91c11e' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#91c11e' }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 