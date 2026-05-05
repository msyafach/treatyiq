import api from './axios'

export const getDocuments = (params) =>
  api.get('/documents/', { params })

export const uploadDocument = (formData) =>
  api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteDocument = (id) =>
  api.delete(`/documents/${id}/`)

export const getDocumentDownloadUrl = (id) =>
  `/api/documents/${id}/download/`
