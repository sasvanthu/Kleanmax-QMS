import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { User } from '../services/types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  currentUser,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUser={currentUser}
        onNavigate={onNavigate}
      />
      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
