import { AlertTriangle } from 'lucide-react'

const CONFIG = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
  flagged: { label: 'Ditandai', className: 'bg-red-100 text-red-800', icon: true },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.icon && <AlertTriangle size={11} />}
      {cfg.label}
    </span>
  )
}
