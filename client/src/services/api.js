import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'production'
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api'),
    withCredentials: true
});

export const loginAdmin = async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
};

export const createLead = async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
};

export const getLeadById = async (leadId) => {
    const response = await api.get(`/leads/${leadId}`);
    return response.data;
};

// ... existing code ...
export const markAsBooked = async (leadId, eventUri = null) => {
    const response = await api.put(`/leads/${leadId}/book`, { eventUri });
    return response.data;
};

export const getLeads = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.tag?.length > 0) params.append('tag', filters.tag.join(','));
    if (filters.monthlyBudget?.length > 0) params.append('monthlyBudget', filters.monthlyBudget.join(','));
    if (filters.businessType?.length > 0) params.append('businessType', filters.businessType.join(','));

    const queryString = params.toString();
    const endpoint = queryString ? `/leads?${queryString}` : '/leads';

    const response = await api.get(endpoint);
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/leads/stats');
    return response.data;
};

export const logoutAdmin = async () => {
    const response = await api.post('/admin/logout');
    return response.data;
};

export const checkAuth = async () => {
    const response = await api.get('/admin/check');
    return response.data;
};

export default api;
