import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: LucideIcon
  color: 'indigo' | 'rose' | 'amber' | 'slate'
  onClick: () => void
  active: boolean
}

export function StatCard({ title, value, subtitle, icon: Icon, color, onClick, active }: StatCardProps) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100'
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 border-2",
        active ? "ring-4 ring-indigo-500/10 shadow-lg" : "hover:border-slate-300 shadow-sm",
        active ? colors[color] : "border-slate-200/60"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <h3 className={cn("text-4xl font-black tracking-tighter", active ? colors[color].split(' ')[0] : "text-slate-800")}>
              {value}
            </h3>
            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
          </div>
          <div className={cn("p-3 rounded-2xl", colors[color])}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
