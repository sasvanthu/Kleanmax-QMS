import React from 'react';
import { Navbar } from './Navbar';
import { User } from '../services/types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  currentUser,
  onNavigate,
  onLogout = () => {},
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
