import { cn } from '@/lib/utils'

interface PageContainerProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageContainer({ title, subtitle, actions, children, className }: PageContainerProps) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-screen overflow-auto', className)}>
      {/* Page header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {children}
      </main>
    </div>
  )
}
