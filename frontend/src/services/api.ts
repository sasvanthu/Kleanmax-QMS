import {
  User, Customer, Service, ServiceRate, Quotation, CalculationResult,
  CompanySetting
} from './types';

const BASE_URL = '/api';

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
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
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
    list: (category?: string) => {
      const q = category ? `?category=${encodeURIComponent(category)}` : '';
      return request<Service[]>(`/services${q}`);
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
    addRate: (id: string, data: Partial<ServiceRate>) => request<ServiceRate>(`/services/${id}/rates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  quotations: {
    calculate: (payload: any) => request<CalculationResult>('/quotations/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    list: (params: { search?: string; status?: string; customer_id?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.status) q.append('status', params.status);
      if (params.customer_id) q.append('customer_id', params.customer_id);
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
    revise: (id: string, reason: string) => request<Quotation>(`/quotations/${id}/revise`, {
      method: 'POST',
      body: JSON.stringify({ revision_reason: reason }),
    }),
    getPdfUrl: (id: string) => `/api/quotations/${id}/pdf`,
    getHtmlUrl: (id: string) => `/api/quotations/${id}/html`,
  },

  company: {
    get: () => request<CompanySetting>('/company'),
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
