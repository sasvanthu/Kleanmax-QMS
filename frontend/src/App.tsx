import React, { useState, useEffect } from 'react';
import { User } from './services/types';
import { api } from './services/api';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

// 5 Dashboards
import { Dashboard } from './pages/Dashboard'; // Merged Super Admin & 4 Companies Home
import { KleanmaxProDashboard } from './pages/KleanmaxProDashboard'; // Company 1: Kleanmax Pro
import { KleanmaxDashboard } from './pages/KleanmaxDashboard'; // Company 2: Kleanmax
import { UniquePaintersDashboard } from './pages/UniquePaintersDashboard'; // Company 3: Unique Painters
import { CleantechDashboard } from './pages/CleantechDashboard'; // Company 4: Cleantech Services
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'; // Super Admin Console (Merged)

// Quotation & Operational Pages
import { QuotationsList } from './pages/QuotationsList';
import { QuotationCreate } from './pages/QuotationCreate';
import { QuotationEdit } from './pages/QuotationEdit';
import { QuotationDetail } from './pages/QuotationDetail';
import { Customers } from './pages/Customers';
import { ServicesCatalogue } from './pages/ServicesCatalogue';
import { CompanySettings } from './pages/CompanySettings';
import { KleanmaxProAreaQuotation } from './pages/KleanmaxProAreaQuotation';
import { KleanmaxSparesQuotation } from './pages/KleanmaxSparesQuotation';
import { KleanmaxSalesQuotation } from './pages/KleanmaxSalesQuotation';
import { KleanmaxGenerator } from './pages/KleanmaxGenerator';
import { UniquePaintersGenerator } from './pages/UniquePaintersGenerator';
import { CleantechGenerator } from './pages/CleantechGenerator';
import { PdfPreviewModal } from './components/quotation/PdfPreviewModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.auth.getStoredUser());
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const user = api.auth.getStoredUser();
    if (!user) return 'dashboard';
    if (user.company_code === 'kleanmaxpro') return 'kleanmaxpro_dash';
    if (user.company_code === 'kleanmax') return 'kleanmax_dash';
    if (user.company_code === 'uniquepainters') return 'uniquepainters_dash';
    if (user.company_code === 'cleantech') return 'cleantech_dash';
    return 'dashboard';
  });
  const [pageParams, setPageParams] = useState<any>({});

  // Global PDF preview modal
  const [previewQuotationId, setPreviewQuotationId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Handle successful login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.company_code === 'kleanmaxpro') {
      setCurrentPage('kleanmaxpro_dash');
    } else if (user.company_code === 'kleanmax') {
      setCurrentPage('kleanmax_dash');
    } else if (user.company_code === 'uniquepainters') {
      setCurrentPage('uniquepainters_dash');
    } else if (user.company_code === 'cleantech') {
      setCurrentPage('cleantech_dash');
    } else {
      setCurrentPage('dashboard');
    }
    setPageParams({});
  };

  // Handle logout
  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setPageParams({});
  };

  // Navigation with Role-Based Access Control Lock
  const handleNavigate = (page: string, params: any = {}) => {
    if (!currentUser) return;

    const userCompany = currentUser.company_code;
    const isSuperAdmin = currentUser.role === 'admin' || userCompany === 'all' || !userCompany;

    if (!isSuperAdmin) {
      // Company Staff Lock
      if (userCompany === 'kleanmaxpro') {
        const allowed = page.startsWith('kleanmaxpro') || page === 'quotation_detail' || page === 'services' || (page === 'quotation_edit' && (!params.company_code || params.company_code === 'kleanmaxpro')) || (page === 'settings' && params.tab === 'kleanmaxpro');
        if (!allowed) {
          setCurrentPage('kleanmaxpro_dash');
          return;
        }
      } else if (userCompany === 'kleanmax') {
        const allowed = page.startsWith('kleanmax') || page === 'quotation_detail' || (page === 'quotation_edit' && (!params.company_code || params.company_code === 'kleanmax')) || (page === 'settings' && params.tab === 'kleanmax');
        if (!allowed) {
          setCurrentPage('kleanmax_dash');
          return;
        }
      } else if (userCompany === 'uniquepainters') {
        const allowed = page.startsWith('uniquepainters') || page === 'quotation_detail' || (page === 'quotation_edit' && (!params.company_code || params.company_code === 'uniquepainters')) || (page === 'settings' && params.tab === 'uniquepainters');
        if (!allowed) {
          setCurrentPage('uniquepainters_dash');
          return;
        }
      } else if (userCompany === 'cleantech') {
        const allowed = page.startsWith('cleantech') || page === 'quotation_detail' || (page === 'quotation_edit' && (!params.company_code || params.company_code === 'cleantech')) || (page === 'settings' && params.tab === 'cleantech');
        if (!allowed) {
          setCurrentPage('cleantech_dash');
          return;
        }
      }
    }

    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPreview = (quotationId: string) => {
    setPreviewQuotationId(quotationId);
    setPreviewModalOpen(true);
  };

  // If user is not logged in, directly show Login page first
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      // MERGED HOME & SUPER ADMIN
      case 'dashboard':
      case 'superadmin_dash':
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );

      // DASHBOARD 2: COMPANY 1 - KLEANMAX PRO
      case 'kleanmaxpro_dash':
        return (
          <KleanmaxProDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'kleanmaxpro_area':
        return (
          <KleanmaxProAreaQuotation
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            quotationId={pageParams?.id}
          />
        );
      case 'kleanmaxpro_quotes':
        return (
          <QuotationsList
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            defaultBrandFilter="kleanmaxpro"
          />
        );

      // DASHBOARD 3: COMPANY 2 - KLEANMAX
      case 'kleanmax_dash':
        return (
          <KleanmaxDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'kleanmax_generator':
      case 'kleanmax_spares':
        return (
          <KleanmaxGenerator
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            quotationId={pageParams?.id}
          />
        );
      case 'kleanmax_sales':
        return (
          <KleanmaxSalesQuotation
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'kleanmax_quotes':
        return (
          <QuotationsList
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            defaultBrandFilter="kleanmax"
          />
        );

      // DASHBOARD 4: COMPANY 3 - UNIQUE PAINTERS
      case 'uniquepainters_dash':
        return (
          <UniquePaintersDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'uniquepainters_generator':
        return (
          <UniquePaintersGenerator
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            quotationId={pageParams?.id}
          />
        );
      case 'uniquepainters_quotes':
        return (
          <QuotationsList
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            defaultBrandFilter="uniquepainters"
          />
        );

      // DASHBOARD 5: COMPANY 4 - CLEANTECH SERVICES
      case 'cleantech_dash':
        return (
          <CleantechDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'cleantech_generator':
        return (
          <CleantechGenerator
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            quotationId={pageParams?.id}
          />
        );
      case 'cleantech_quotes':
        return (
          <QuotationsList
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            defaultBrandFilter="cleantech"
          />
        );

      // UNIFIED ADMIN: SHARED & MANAGEMENT PAGES
      case 'quotations':
        return (
          <QuotationsList
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            defaultBrandFilter="all"
          />
        );
      case 'create_quotation':
        return (
          <QuotationCreate
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
            initialQuotation={pageParams}
          />
        );
      case 'quotation_edit':
        return (
          <QuotationEdit
            quotationId={pageParams?.id}
            initialCompanyCode={pageParams?.company_code || currentUser?.company_code}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'quotation_detail':
        return (
          <QuotationDetail
            quotationId={pageParams?.id}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'customers':
        return (
          <Customers
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );
      case 'services':
        return (
          <ServicesCatalogue
            currentUser={currentUser}
          />
        );
      case 'settings':
        return (
          <CompanySettings
            currentUser={currentUser}
            initialTab={pageParams?.tab || (currentUser?.company_code !== 'all' ? currentUser?.company_code : 'kleanmaxpro')}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}

      {/* Global Quotation PDF Preview Modal */}
      <PdfPreviewModal
        quotationId={previewQuotationId}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </Layout>
  );
};

export default App;
