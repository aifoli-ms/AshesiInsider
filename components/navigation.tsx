'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  isAuthed?: boolean;
  onSignOut?: () => void;
}

export default function Navigation({ currentPage, onNavigate, onSignIn, isAuthed, onSignOut }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'courses', label: 'Courses' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'lecturers', label: 'Lecturers' },
    { id: 'hostels', label: 'Hostels' },
  ];

  return (
    <nav className="bg-secondary text-secondary-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
              🎓
            </div>
            <span className="font-bold text-xl hidden sm:inline">Ashesi Insider</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
									className={`relative flex items-center gap-2 px-3 py-2 transition-colors border-b-2 ${
										currentPage === item.id
											? 'text-black border-red-500'
											: 'text-black border-transparent hover:border-red-200'
									}`}
                >
                 
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sign In Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isAuthed) {
                  onSignOut?.();
                } else {
                  onSignIn();
                }
              }}
              className="hidden sm:block bg-black text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {isAuthed ? 'Sign Out' : 'Sign Up'}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-secondary border-t border-secondary-foreground/20 py-4">
            {navItems.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-opacity-80'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                if (isAuthed) {
                  onSignOut?.();
                } else {
                  onSignIn();
                }
                setMobileMenuOpen(false);
              }}
              className="w-full mt-4 mx-4 bg-black text-white px-6 py-2 rounded-lg font-semibold"
            >
              {isAuthed ? 'Sign Out' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
