// Lightweight, zero-dependency browser router for QMS
// Maps between application internal page keys and clean human-readable URLs

export interface RouteState {
  page: string;
  params: Record<string, any>;
}

// Map from internal page key & params to a URL path
export const pageToPath = (page: string, params: Record<string, any> = {}): string => {
  switch (page) {
    case 'dashboard':
    case 'superadmin_dash':
      return '/';

    // Klean Max Pro
    case 'kleanmaxpro_dash':
      return '/company/kleanmaxpro';
    case 'kleanmaxpro_area':
      return params?.id
        ? `/company/kleanmaxpro/generate?id=${encodeURIComponent(params.id)}`
        : '/company/kleanmaxpro/generate';
    case 'kleanmaxpro_quotes':
      return '/company/kleanmaxpro/records';

    // Kleanmax
    case 'kleanmax_dash':
      return '/company/kleanmax';
    case 'kleanmax_generator':
    case 'kleanmax_spares':
      return params?.id
        ? `/company/kleanmax/generate?id=${encodeURIComponent(params.id)}`
        : '/company/kleanmax/generate';
    case 'kleanmax_sales':
      return '/company/kleanmax/sales';
    case 'kleanmax_quotes':
      return '/company/kleanmax/records';

    // Unique Painters
    case 'uniquepainters_dash':
      return '/company/uniquepainters';
    case 'uniquepainters_generator':
      return params?.id
        ? `/company/uniquepainters/generate?id=${encodeURIComponent(params.id)}`
        : '/company/uniquepainters/generate';
    case 'uniquepainters_quotes':
      return '/company/uniquepainters/records';

    // Cleantech Services
    case 'cleantech_dash':
      return '/company/cleantech';
    case 'cleantech_generator':
      return params?.id
        ? `/company/cleantech/generate?id=${encodeURIComponent(params.id)}`
        : '/company/cleantech/generate';
    case 'cleantech_quotes':
      return '/company/cleantech/records';

    // Master Features / Unified Admin
    case 'settings':
      return params?.tab ? `/admin/companies?tab=${encodeURIComponent(params.tab)}` : '/admin/companies';
    case 'customers':
      return '/admin/customers';
    case 'quotations':
      return '/admin/records';
    case 'services':
      return '/admin/catalogue';

    // Shared Quotations
    case 'create_quotation':
      return '/quotations/create';
    case 'quotation_detail':
      return params?.id ? `/quotations/${encodeURIComponent(params.id)}` : '/admin/records';
    case 'quotation_edit':
      if (params?.id) {
        const comp = params.company_code ? `?company_code=${encodeURIComponent(params.company_code)}` : '';
        return `/quotations/${encodeURIComponent(params.id)}/edit${comp}`;
      }
      return '/admin/records';

    case 'login':
      return '/login';

    default:
      return '/';
  }
};

// Map from a browser URL path and search string to internal page key & params
export const pathToPage = (pathname: string, search: string = ''): RouteState => {
  // Normalize pathname: remove trailing slash except root
  let path = pathname.trim();
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Parse search params
  const searchParams = new URLSearchParams(search);
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Quotation Detail: /quotations/:id
  const detailMatch = path.match(/^\/quotations\/([^\/]+)$/);
  if (detailMatch && detailMatch[1] !== 'create') {
    return {
      page: 'quotation_detail',
      params: { id: decodeURIComponent(detailMatch[1]), ...queryParams },
    };
  }

  // Quotation Edit: /quotations/:id/edit
  const editMatch = path.match(/^\/quotations\/([^\/]+)\/edit$/);
  if (editMatch) {
    return {
      page: 'quotation_edit',
      params: { id: decodeURIComponent(editMatch[1]), ...queryParams },
    };
  }

  switch (path) {
    case '':
    case '/':
    case '/dashboard':
      return { page: 'dashboard', params: queryParams };

    // Company 1: Klean Max Pro
    case '/company/kleanmaxpro':
    case '/kleanmaxpro':
      return { page: 'kleanmaxpro_dash', params: queryParams };
    case '/company/kleanmaxpro/generate':
    case '/kleanmaxpro/generate':
      return { page: 'kleanmaxpro_area', params: queryParams };
    case '/company/kleanmaxpro/records':
    case '/kleanmaxpro/records':
      return { page: 'kleanmaxpro_quotes', params: queryParams };

    // Company 2: Kleanmax
    case '/company/kleanmax':
    case '/kleanmax':
      return { page: 'kleanmax_dash', params: queryParams };
    case '/company/kleanmax/generate':
    case '/kleanmax/generate':
      return { page: 'kleanmax_generator', params: queryParams };
    case '/company/kleanmax/sales':
    case '/kleanmax/sales':
      return { page: 'kleanmax_sales', params: queryParams };
    case '/company/kleanmax/records':
    case '/kleanmax/records':
      return { page: 'kleanmax_quotes', params: queryParams };

    // Company 3: Unique Painters
    case '/company/uniquepainters':
    case '/uniquepainters':
      return { page: 'uniquepainters_dash', params: queryParams };
    case '/company/uniquepainters/generate':
    case '/uniquepainters/generate':
      return { page: 'uniquepainters_generator', params: queryParams };
    case '/company/uniquepainters/records':
    case '/uniquepainters/records':
      return { page: 'uniquepainters_quotes', params: queryParams };

    // Company 4: Cleantech Services
    case '/company/cleantech':
    case '/cleantech':
      return { page: 'cleantech_dash', params: queryParams };
    case '/company/cleantech/generate':
    case '/cleantech/generate':
      return { page: 'cleantech_generator', params: queryParams };
    case '/company/cleantech/records':
    case '/cleantech/records':
      return { page: 'cleantech_quotes', params: queryParams };

    // Master Features / Admin
    case '/admin/companies':
    case '/settings':
      return { page: 'settings', params: queryParams };
    case '/admin/customers':
    case '/customers':
      return { page: 'customers', params: queryParams };
    case '/admin/records':
    case '/quotations':
      return { page: 'quotations', params: queryParams };
    case '/admin/catalogue':
    case '/services':
      return { page: 'services', params: queryParams };
    case '/quotations/create':
      return { page: 'create_quotation', params: queryParams };

    case '/login':
      return { page: 'login', params: queryParams };

    default:
      return { page: 'dashboard', params: queryParams };
  }
};
