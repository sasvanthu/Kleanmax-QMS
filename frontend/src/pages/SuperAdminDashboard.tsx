import React from 'react';
import { User } from '../services/types';
import { Dashboard } from './Dashboard';

interface SuperAdminDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenPreview?: (quotationId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenPreview = () => {},
}) => {
  return (
    <Dashboard
      currentUser={currentUser}
      onNavigate={onNavigate}
      onOpenPreview={onOpenPreview}
    />
  );
};

export default SuperAdminDashboard;
