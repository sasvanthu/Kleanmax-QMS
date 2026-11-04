import {
  User, Customer, Service, ServiceRate, Quotation, CalculationResult,
  CompanySetting
} from './types';

const BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      // Clone response to avoid stream already read errors
      const cloned = response.clone();
      const text = await cloned.text();
      try {
        const errJson = JSON.parse(text);
        errorDetail = errJson.detail || errJson.message || text;
      } catch {
        if (text && text.length < 500) {
          errorDetail = text;
        }
      }
    } catch {
      // Keep default errorDetail
    }
    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    },
    me: () => request<User>('/auth/me'),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getStoredUser: (): User | null => {
      const str = localStorage.getItem('user');
      return str ? JSON.parse(str) : null;
    }
  },

  customers: {
    list: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<Customer[]>(`/customers${q}`);
    },
    get: (id: string) => request<Customer>(`/customers/${id}`),
    create: (data: Partial<Customer>) => request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Customer>) => request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  services: {
    list: (params: { category?: string; company_code?: string; search?: string; is_active?: boolean } | string = {}) => {
      const q = new URLSearchParams();
      if (typeof params === 'string') {
        if (params) q.append('category', params);
      } else {
        if (params.category) q.append('category', params.category);
        if (params.company_code) q.append('company_code', params.company_code);
        if (params.search) q.append('search', params.search);
        if (params.is_active !== undefined) q.append('is_active', String(params.is_active));
      }
      const qs = q.toString();
      return request<Service[]>(`/services${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<Service>(`/services/${id}`),
    create: (data: Partial<Service>) => request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Service>) => request<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),
    addRate: (id: string, data: Partial<ServiceRate>) => request<ServiceRate>(`/services/${id}/rates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  quotations: {
    getNextNumber: (company_code: string = 'kleanmaxpro', format_style: string = 'short') =>
      request<{ company_code: string; prefix: string; next_sequence: number; next_number: string }>(
        `/quotations/next-number?company_code=${encodeURIComponent(company_code)}&format_style=${encodeURIComponent(format_style)}`
      ),
    calculate: (payload: any) => request<CalculationResult>('/quotations/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    list: (params: { search?: string; status?: string; customer_id?: string; company_code?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.status) q.append('status', params.status);
      if (params.customer_id) q.append('customer_id', params.customer_id);
      if (params.company_code) q.append('company_code', params.company_code);
      return request<Quotation[]>(`/quotations?${q.toString()}`);
    },
    get: (id: string) => request<Quotation>(`/quotations/${id}`),
    create: (data: any) => request<Quotation>('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<Quotation>(`/quotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    submit: (id: string) => request<Quotation>(`/quotations/${id}/submit`, { method: 'POST' }),
    approve: (id: string) => request<Quotation>(`/quotations/${id}/approve`, { method: 'POST' }),
    issue: (id: string) => request<Quotation>(`/quotations/${id}/issue`, { method: 'POST' }),
    cancel: (id: string) => request<Quotation>(`/quotations/${id}/cancel`, { method: 'POST' }),
    delete: (id: string) => request<{ message: string; id: string }>(`/quotations/${id}`, { method: 'DELETE' }),
    revise: (id: string, reason: string) => request<Quotation>(`/quotations/${id}/revise`, {
      method: 'POST',
      body: JSON.stringify({ revision_reason: reason }),
    }),
    getPdfUrl: (id: string) => `${BASE_URL}/quotations/${id}/pdf`,
    getDocxUrl: (id: string) => `${BASE_URL}/quotations/${id}/docx`,
    getHtmlUrl: (id: string) => `${BASE_URL}/quotations/${id}/html`,
    downloadPdf: async (id: string, filename?: string) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/quotations/${id}/pdf`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('PDF generation response not OK');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `Quotation_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Blob download fallback, opening direct link:', err);
        window.open(`${BASE_URL}/quotations/${id}/pdf`, '_blank');
      }
    },
    downloadDocx: async (id: string, filename?: string) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/quotations/${id}/docx`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Word generation response not OK');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `Quotation_${id}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Blob docx download fallback, opening direct link:', err);
        window.open(`${BASE_URL}/quotations/${id}/docx`, '_blank');
      }
    },
  },

  company: {
    get: (code?: string) => {
      const q = code ? `?code=${encodeURIComponent(code)}` : '';
      return request<CompanySetting>(`/company${q}`);
    },
    getAll: () => request<CompanySetting[]>('/company/all'),
    getByIdentifier: (identifier: string) => request<CompanySetting>(`/company/${identifier}`),
    updateByIdentifier: (identifier: string, data: Partial<CompanySetting>) => request<CompanySetting>(`/company/${identifier}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    update: (data: Partial<CompanySetting>) => request<CompanySetting>('/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  auditLogs: {
    list: (entity_type?: string) => {
      const q = entity_type ? `?entity_type=${encodeURIComponent(entity_type)}` : '';
      return request<any[]>(`/audit-logs${q}`);
    }
  }
};
