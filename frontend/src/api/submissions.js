import api from './axios'

export const getSubmissions = (params) =>
  api.get('/submissions/', { params })

export const getSubmission = (id) =>
  api.get(`/submissions/${id}/`)

export const createSubmission = (data) =>
  api.post('/submissions/', data)

export const approveSubmission = (id) =>
  api.post(`/submissions/${id}/approve/`)

export const rejectSubmission = (id, rejection_reason) =>
  api.post(`/submissions/${id}/reject/`, { rejection_reason })

export const revokeSubmission = (id) =>
  api.post(`/submissions/${id}/revoke/`)

export const getDashboardStats = () =>
  api.get('/dashboard/stats/')
