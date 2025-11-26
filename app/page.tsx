'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import SignInModal from '@/components/sign-in-modal';
import HomePage from '@/components/pages/home-page';
import CoursesPage from '@/components/pages/courses-page';
import RestaurantsPage from '@/components/pages/restaurants-page';
import LecturersPage from '@/components/pages/lecturers-page';
import HostelsPage from '@/components/pages/hostels-page';
import AddReviewPage from '@/components/pages/add-review-page';
import AdminDashboard from '@/components/pages/admin-dashboard';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<'courses' | 'restaurants' | 'lecturers' | 'hostels'>('courses');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const authed = res.ok;
        setIsAuthed(authed);
        if (authed) {
          const data = await res.json();
          setIsAdmin(data.user?.role === 'admin');
        }
        setShowSignIn(!authed);
      } catch {
        setIsAuthed(false);
        setShowSignIn(true);
      }
    };
    void loadSession();
  }, []);

  const protectedPages = new Set(['courses', 'restaurants', 'lecturers', 'hostels']);

  const handleNavigate = (page: string) => {
    if (page.startsWith('add-review-')) {
      const type = page.replace('add-review-', '') as 'courses' | 'restaurants' | 'lecturers' | 'hostels';
      if (!isAuthed) {
        setPendingPage(page);
        setShowSignIn(true);
        return;
      }
      setReviewType(type);
      setCurrentPage('add-review');
      return;
    }
    if (protectedPages.has(page) && !isAuthed) {
      setPendingPage(page);
      setShowSignIn(true);
      return;
    }
    if (page === 'admin' && !isAdmin) {
      alert('Unauthorized');
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'courses':
        return <CoursesPage onNavigate={handleNavigate} />;
      case 'restaurants':
        return <RestaurantsPage onNavigate={handleNavigate} />;
      case 'lecturers':
        return <LecturersPage onNavigate={handleNavigate} />;
      case 'hostels':
        return <HostelsPage onNavigate={handleNavigate} />;
      case 'add-review':
        return (
          <AddReviewPage
            reviewType={reviewType}
            onNavigate={handleNavigate}
            onCancel={() => handleNavigate(reviewType)}
          />
        );
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <HomePage onNavigate={handleNavigate} />;
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
        isAdmin={isAdmin}
        onSignOut={async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } finally {
            setIsAuthed(false);
            setIsAdmin(false);
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
            setIsAuthed(true);
            // Re-fetch session to get role
            fetch('/api/auth/session').then(res => res.json()).then(data => {
              setIsAdmin(data.user?.role === 'admin');
            });
            if (pendingPage) {
              if (pendingPage.startsWith('add-review-')) {
                const type = pendingPage.replace('add-review-', '') as 'courses' | 'restaurants' | 'lecturers' | 'hostels';
                setReviewType(type);
                setCurrentPage('add-review');
              } else {
                setCurrentPage(pendingPage);
              }
              setPendingPage(null);
            } else {
              setCurrentPage('courses');
            }
            setIsAuthed(true);
          }}
        />
      )}
    </div>
  );
}
