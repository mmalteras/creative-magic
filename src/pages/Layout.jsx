

import React, { useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  Bot,
  LayoutGrid,
  LogIn,
  LogOut,
  Sparkles,
  Zap,
  CreditCard,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingDots from "@/components/common/LoadingDots";
import LoginModal from "@/components/common/LoginModal";
import LegalModal from "@/components/common/LegalModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  useEffect(() => {
    const fetchUserAndGrantCredits = async () => {
      setAuthLoading(true);
      try {
        const userData = await User.me();

        if (userData && !userData.free_credits_claimed) {
          await User.update(userData.id, {
            credits: (userData.credits || 0) + 4,
            free_credits_claimed: true
          });
          const updatedUserData = await User.me();
          setUser(updatedUserData);
        } else {
          setUser(userData);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserAndGrantCredits();

    // Listen for auth state changes (OAuth redirects, sign in, sign out)
    const { data: { subscription } } = User.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserAndGrantCredits();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const protectedPages = ['MyGallery', 'Fonts', 'Analyze', 'Upload', 'Editor', 'CreativeHub', 'Business']; // Added 'Business'
    if (!authLoading && !user && protectedPages.includes(currentPageName)) {
      setShowLoginModal(true);
    }
  }, [user, authLoading, currentPageName]);

  useEffect(() => {
    // Basic SEO: Set page title
    document.title = currentPageName ? `${currentPageName} | Creative Magic` : "Creative Magic";

    // Set meta description (can be more dynamic if needed)
    const metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (metaDescriptionTag) {
      metaDescriptionTag.setAttribute('content', `Generate stunning thumbnails and creative copy with Creative Magic. ${currentPageName ? `Explore our ${currentPageName} features.` : ''}`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Generate stunning thumbnails and creative copy with Creative Magic. ${currentPageName ? `Explore our ${currentPageName} features.` : ''}`;
      document.head.appendChild(meta);
    }

    // You might also want to set canonical URLs
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const fullUrl = window.location.origin + location.pathname;
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = fullUrl;
      document.head.appendChild(link);
    }
  }, [currentPageName, location.pathname]);

  if (location.pathname === '/') {
    return <Navigate to={createPageUrl("Home")} replace />;
  }

  const handleProtectedLinkClick = (e, pageName) => {
    const protectedPages = ['MyGallery', 'Fonts', 'CreativeHub', 'Business']; // Added 'Business'
    if (!user && protectedPages.includes(pageName)) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  }

  const navLinks = [
    { page: "Home", icon: ImageIcon, label: "קאברים" },
    { page: "CreativeHub", icon: Bot, label: "מרכז הקריאייטיב" },
    { page: "Business", icon: CreditCard, label: "העסקים" },
    { page: "MyGallery", icon: LayoutGrid, label: "גלריה" },
    { page: "Pricing", icon: CreditCard, label: "תמחור" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col" dir="rtl" data-page={currentPageName}>
      <LoginModal isOpen={showLoginModal} setIsOpen={setShowLoginModal} />
      <LegalModal activeModal={activeLegalModal} setActiveModal={setActiveLegalModal} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
        :root {
          /* Color variables */
          --background: 220 14% 96%;
          --foreground: 220 8.9% 15%;
          --card: 0 0% 100%;
          --card-foreground: 220 8.9% 15%;
          --popover: 0 0% 100%;
          --popover-foreground: 220 8.9% 15%;
          --primary: 262.1 83.3% 57.8%;
          --primary-foreground: 0 0% 100%;
          --secondary: 220 14.3% 95.9%;
          --secondary-foreground: 220.9 39.3% 11%;
          --muted: 220 14.3% 95.9%;
          --muted-foreground: 220 8.9% 46.1%;
          --accent: 172.1 83.3% 47.8%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 220 13% 91%;
          --input: 220 13% 91%;
          --ring: 262.1 83.3% 57.8%;
          --radius: 0.75rem;
          --gradient-start: #8B5CF6; /* Purple-500 */
          --gradient-end: #14B8A6;   /* Teal-500 */
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% 200%; /* Important for the background-position to work */
        }

        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .hebrew-font { font-family: 'Heebo', 'Rubik', sans-serif; }
        h1, h2, h3, .headline { font-family: 'Heebo', sans-serif; font-weight: 800; letter-spacing: -0.03em; }

        .btn-gradient {
          background-image: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
          color: white;
          font-weight: 600;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px -5px rgba(139, 92, 246, 0.4);
        }
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px -5px rgba(139, 92, 246, 0.6);
        }

        .text-gradient {
          background: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          color: #374151; /* gray-700 */
          transition: all 0.2s ease;
        }
        .nav-link:hover { background-color: #F9FAFB; color: #111827; }
        .nav-link.active { background: linear-gradient(45deg, #EDE9FE, #CCFBF1); color: #6D28D9; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-300 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 w-full flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-bold text-gradient animate-gradient hebrew-font text-xl tracking-tight hidden sm:block">Creative Magic</h2>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(({ page, icon: Icon, label }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={(e) => handleProtectedLinkClick(e, page)}
                  className={`nav-link text-sm hebrew-font ${currentPageName === page ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {authLoading ? (
              <div className="w-24 h-9 flex items-center justify-center">
                <LoadingDots color="bg-gray-600" />
              </div>
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-purple-50 to-teal-50 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="tabular-nums text-gray-800 font-semibold text-sm">{user.credits ?? 0}</span>
                    </div>

                    <Button
                      variant="ghost"
                      className="rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 px-3 py-2 h-auto"
                      onClick={async () => {
                        await User.logout();
                        window.location.href = createPageUrl("Home");
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hebrew-font text-sm">יציאה</span>
                    </Button>
                  </div>
                ) : (
                  <button
                    className="btn-gradient flex items-center gap-2 px-4 py-2 text-sm"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <LogIn className="w-4 h-4" />
                    התחברות | הרשמה
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow ${['CreativeHub', 'Editor'].includes(currentPageName) ? 'pt-20 md:pt-24 h-screen overflow-hidden' : 'pt-20 md:pt-24'} flex flex-col ${currentPageName === 'Editor' ? 'bg-white' : ''}`}>
        <div className={`flex-grow flex flex-col w-full ${['CreativeHub', 'Editor'].includes(currentPageName) ? 'h-full' : ''}`}>
          {user || !['MyGallery', 'Fonts', 'Analyze', 'Upload', 'Editor', 'CreativeHub', 'Business'].includes(currentPageName) ? (
            children
          ) : (
            <div className="flex items-center justify-center h-full">
              {/* This space is intentionally left to be managed by the modal */}
            </div>
          )}
        </div>
      </main>

      <footer className={`border-t border-gray-300 bg-white/80 ${currentPageName === 'CreativeHub' ? 'fixed bottom-0 left-0 right-0 z-40' : 'mt-auto'} ${currentPageName === 'Editor' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setActiveLegalModal('privacy')} className="text-sm text-gray-600 hover:text-gray-900 hover:underline hebrew-font">
              מדיניות פרטיות
            </button>
            <span className="text-gray-400">•</span>
            <button onClick={() => setActiveLegalModal('terms')} className="text-sm text-gray-600 hover:text-gray-900 hover:underline hebrew-font">
              תקנון שימוש
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

