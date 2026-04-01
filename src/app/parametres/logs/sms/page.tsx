'use client'

import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminGuard } from '@/components/layout/AdminGuard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowLeft, Eye, Clock, Phone, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

export default function SmsLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['logs', 'sms'],
    queryFn: async () => {
      const res = await fetch('/api/logs/sms')
      return res.json()
    }
  })

  const logs = data?.data || []

  return (
    <AdminGuard>
      <div className="flex bg-[#f4f6fb] text-[#1a2340] min-h-screen">
        <Sidebar />
        <PageContainer 
          title="Logs des SMS" 
          subtitle="Historique des notifications mobiles envoyées"
        >
          <div className="mb-6 flex items-center gap-4">
            <Link href="/parametres" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                <ArrowLeft size={18} />
            </Link>
            <PageHeader title="Historique SMS" icon={MessageSquare} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[180px] font-bold text-slate-400 uppercase text-[10px] tracking-wider"><div className="flex items-center gap-2"><Clock size={12} /> Date</div></TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider"><div className="flex items-center gap-2"><Phone size={12} /> Destinataire</div></TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider"><div className="flex items-center gap-2"><FileText size={12} /> Message</div></TableHead>
                  <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-wider">Statut</TableHead>
                  <TableHead className="text-right font-bold text-slate-400 uppercase text-[10px] tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1,2].map(i => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="h-16 bg-slate-50/20"></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium italic">Aucun log trouvé</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(log.sent_at)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-700">{log.to}</TableCell>
                      <TableCell className="text-sm text-slate-600 truncate max-w-[300px]">{log.message}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} variant="outline">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Voir le contenu">
                              <Eye size={16} />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3 text-slate-800">
                                <MessageSquare className="text-indigo-500" size={20} />
                                Détails SMS
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                               <div className="grid grid-cols-4 gap-4 pb-4 border-b border-slate-100 text-sm">
                                  <div className="text-slate-400 font-medium">À :</div>
                                  <div className="col-span-3 font-bold text-slate-700 uppercase">{log.to}</div>
                                  <div className="text-slate-400 font-medium">Le :</div>
                                  <div className="col-span-3 text-slate-600">{formatDate(log.sent_at)}</div>
                               </div>
                               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-sm text-slate-700 whitespace-pre-wrap leading-relaxed ring-1 ring-slate-100 shadow-inner">
                                  "{log.message}"
                               </div>
                               {log.error && (
                                 <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-xs text-rose-700">
                                    <div className="font-bold uppercase mb-1">Détails Erreur :</div>
                                    {log.error}
                                 </div>
                               )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </PageContainer>
      </div>
    </AdminGuard>
  )
}
