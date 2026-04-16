interface StatsCardProps {
  label: string
  value: string | number
  icon?: string
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  )
}
