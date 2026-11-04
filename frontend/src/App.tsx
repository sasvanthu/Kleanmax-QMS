import React, { useState, useEffect } from 'react';
import { User } from './services/types';
import { api } from './services/api';
import { Layout } from './components/Layout';

// 5 Dashboards
import { Dashboard } from './pages/Dashboard'; // Dashboard 1: Unified Master Admin
import { KleanmaxProDashboard } from './pages/KleanmaxProDashboard'; // Dashboard 2: Kleanmax Pro
import { KleanmaxDashboard } from './pages/KleanmaxDashboard'; // Dashboard 3: Kleanmax
import { UniquePaintersDashboard } from './pages/UniquePaintersDashboard'; // Dashboard 4: Unique Painters
import { CleantechDashboard } from './pages/CleantechDashboard'; // Dashboard 5: Cleantech Services

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
import { UniquePaintersGenerator } from './pages/UniquePaintersGenerator';
import { CleantechGenerator } from './pages/CleantechGenerator';
import { PdfPreviewModal } from './components/quotation/PdfPreviewModal';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@kleanmaxpro.com',
    full_name: 'Admin',
    role: 'admin',
    is_active: true,
  });

  // Global PDF preview modal
  const [previewQuotationId, setPreviewQuotationId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    initUnifiedSession();
  }, []);

  const initUnifiedSession = async () => {
    try {
      const res = await api.auth.login('admin@kleanmaxpro.com', 'admin123');
      setCurrentUser(res.user);
    } catch (err) {
      console.warn('Backend login fallback to unified state:', err);
      setCurrentUser({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@kleanmaxpro.com',
        full_name: 'Admin',
        role: 'admin',
        is_active: true,
      });
    }
  };

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPreview = (quotationId: string) => {
    setPreviewQuotationId(quotationId);
    setPreviewModalOpen(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      // DASHBOARD 1: UNIFIED MASTER ADMIN
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );

      // DASHBOARD 2: COMPANY 1 - KLEANMAX PRO (3 Pages: Generator, Past Quotes, Editor)
      case 'kleanmaxpro_dash':
      case 'kleanmaxpro_area':
        return (
          <KleanmaxProAreaQuotation
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
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

      // DASHBOARD 3: COMPANY 2 - KLEANMAX (3 Pages: Generator, Past Quotes, Editor)
      case 'kleanmax_dash':
      case 'kleanmax_spares':
        return (
          <KleanmaxSparesQuotation
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
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
      case 'uniquepainters_generator':
        return (
          <UniquePaintersGenerator
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
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
      case 'cleantech_generator':
        return (
          <CleantechGenerator
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
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
            initialCompanyCode={pageParams?.company_code}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );
      case 'quotation_detail':
        return (
          <QuotationDetail
            quotationId={pageParams.id}
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
            initialTab={pageParams?.tab || 'kleanmaxpro'}
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
