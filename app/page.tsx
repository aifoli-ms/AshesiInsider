'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import SignInModal from '@/components/sign-in-modal';
import HomePage from '@/components/pages/home-page';
import CoursesPage from '@/components/pages/courses-page';
import RestaurantsPage from '@/components/pages/restaurants-page';
import LecturersPage from '@/components/pages/lecturers-page';
import HostelsPage from '@/components/pages/hostels-page';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);

  useEffect(() => {
    // Show sign in on first load for demo
    setShowSignIn(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        if (mounted) setIsAuthed(!!data.session);
        supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          setIsAuthed(!!session);
        });
      } catch {
        // ignore; safe fallback to unauthenticated
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const protectedPages = new Set(['courses', 'restaurants', 'lecturers', 'hostels']);

  const handleNavigate = (page: string) => {
    if (protectedPages.has(page) && !isAuthed) {
      setPendingPage(page);
      setShowSignIn(true);
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'courses':
        return <CoursesPage />;
      case 'restaurants':
        return <RestaurantsPage />;
      case 'lecturers':
        return <LecturersPage />;
      case 'hostels':
        return <HostelsPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        onSignIn={() => setShowSignIn(true)}
        isAuthed={isAuthed}
        onSignOut={async () => {
          try {
            if (supabase) {
              await supabase.auth.signOut();
            }
          } finally {
            setCurrentPage('home');
          }
        }}
      />
      {renderPage()}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSuccess={() => {
            setShowSignIn(false);
            if (pendingPage) {
              setCurrentPage(pendingPage);
              setPendingPage(null);
            } else {
              setCurrentPage('courses');
            }
          }}
        />
      )}
    </div>
  );
}
