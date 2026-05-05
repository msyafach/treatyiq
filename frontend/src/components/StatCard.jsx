export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const colors = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
