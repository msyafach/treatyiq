const STATUS_MAP = {
  approved: { label: 'Disetujui', dot: '#13A538', bg: 'rgba(19,165,56,.10)',   fg: '#0E7C2A' },
  pending:  { label: 'Menunggu',  dot: '#F59E0B', bg: 'rgba(245,158,11,.12)',  fg: '#9C5800' },
  flagged:  { label: 'Ditandai',  dot: '#EF4444', bg: 'rgba(239,68,68,.10)',   fg: '#B91C1C' },
  rejected: { label: 'Ditolak',   dot: '#6B7280', bg: 'rgba(107,114,128,.12)', fg: '#374151' },
  draft:    { label: 'Draft',     dot: '#94A3B8', bg: 'rgba(148,163,184,.15)', fg: '#475569' },
}

export default function StatusBadge({ status }) {
  const c = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <span className="tiq-badge" style={{ background: c.bg, color: c.fg }}>
      <span className="tiq-badge-dot" style={{ background: c.dot }} />
      {c.label}
    </span>
  )
}
