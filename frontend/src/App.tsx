import React, { useState, useEffect } from 'react';
import { User } from './services/types';
import { api } from './services/api';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { QuotationsList } from './pages/QuotationsList';
import { QuotationCreate } from './pages/QuotationCreate';
import { QuotationDetail } from './pages/QuotationDetail';
import { Customers } from './pages/Customers';
import { ServicesCatalogue } from './pages/ServicesCatalogue';
import { CompanySettings } from './pages/CompanySettings';
import { KleanmaxProAreaQuotation } from './pages/KleanmaxProAreaQuotation';
import { KleanmaxSparesQuotation } from './pages/KleanmaxSparesQuotation';
import { KleanmaxSalesQuotation } from './pages/KleanmaxSalesQuotation';
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
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenPreview={handleOpenPreview}
          />
        );

      // KLEANMAX PRO Subdivisions
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

      // KLEANMAX Subdivisions (Spares & Sales based on WhatsApp Images)
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

      // Shared / General
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
      />
    </Layout>
  );
};

export default App;
