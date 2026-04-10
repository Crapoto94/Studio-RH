'use client'

import { useState } from 'react'
import { Agent } from '@/types'
import { AgentView } from '@/components/common/AgentView'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { AgentModal } from '@/components/common/AgentModal'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { Eye, Link2, Unlink, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { formatDate, getAgentStatut } from '@/lib/utils'

import { AdLinkingModal } from '@/components/common/AdLinkingModal'

interface AgentsTableProps {
  agents: Agent[]
  loading: boolean
}

export function AgentsTable({ agents, loading }: AgentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [adLinkModalOpen, setAdLinkModalOpen] = useState(false)
  const [agentToLink, setAgentToLink] = useState<Agent | null>(null)

  const columns: ColumnDef<Agent>[] = [
    {
      accessorKey: 'agent',
      header: 'Agent',
      cell: ({ row }) => (
        <AgentView 
          agent={row.original} 
          onClick={() => {
            setSelectedAgent(row.original)
            setModalOpen(true)
          }} 
        />
      ),
    },
    {
      accessorKey: 'structure',
      header: 'Structure',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{row.original.nom_direction || '—'}</span>
          <span className="text-xs text-slate-500">{row.original.nom_service || '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'matricule',
      header: 'Matricule',
      cell: ({ row }) => <span className="font-mono text-sm text-slate-500">{row.original.matricule || '—'}</span>,
    },
    {
      accessorKey: 'mouvement',
      header: 'Mouvement',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-slate-500">
          <span>Arr: {formatDate(row.original.date_arrivee)}</span>
          {row.original.date_depart && <span>Dép: {formatDate(row.original.date_depart)}</span>}
        </div>
      ),
    },
    {
      accessorKey: 'licence',
      header: 'Licence',
      cell: ({ row }) => {
        const lic = row.original.licence
        if (!lic) return <span className="text-slate-400 text-xs">—</span>

        // Mapping skuId → nom lisible
        const skuMap: Record<string, string> = {
          '18181a46-0d4e-45cd-891e-60aabd171b4e': 'O365 E1',
          '6fd2c87f-b296-42f0-b197-1e91e994b900': 'O365 E3',
          'c7df2760-2c81-4ef7-b578-5b5392b571df': 'O365 E5',
          'f30db892-07e9-47e9-837c-80727f46fd3d': 'Power Automate Free',
          '4b585984-651b-448a-9e53-3b10f069cf7f': 'O365 F3',
          '710779e8-3d4a-4c88-adb9-386c958d1fdf': 'Teams Exploratory',
          '05e9a617-0261-4cee-970c-88701fd0fc0b': 'M365 E3',
          '06ebc4ee-1bb5-47dd-8120-11324bc54e06': 'M365 E5',
          '314c4481-f395-4525-be8b-2ec4bb1e9d91': 'M365 F3',
          '1f2f344a-700d-42c9-9427-5cea1d5d7ba6': 'M365 F1',
          'c1ee3550-93dd-4d80-82a1-aa837f44358a': 'M365 F1',
          '1922c0fc-dbfb-4d33-a3d5-e5170f2af205': 'EMS E3',
          'b05e124f-c7cc-45a0-a6aa-8cb78c9bf506': 'EMS E5',
          'cf2db0c0-1fc5-4231-97b7-7ebbf8abec0f': 'Exchange Plan 1',
          '6470687e-a428-4b7a-bef2-8a291ad947c9': 'Windows 10/11 Ent E3'
        }

        let parsed: string[] = []
        try { parsed = JSON.parse(lic) } catch { parsed = [lic] }
        if (!Array.isArray(parsed) || parsed.length === 0) return <span className="text-slate-400 text-xs">—</span>

        // Remplacer les skuIds par leurs noms lisibles
        const resolved = parsed.map(item => skuMap[item] || item)

        const licenseDisplay: Record<string, { label: string; bg: string }> = {
          'O365 E1':  { label: 'E1',  bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
          'O365 E3':  { label: 'E3',  bg: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
          'O365 E5':  { label: 'E5',  bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
          'O365 F3':  { label: 'F3',  bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
          'M365 E3':  { label: 'M365 E3', bg: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
          'M365 E5':  { label: 'M365 E5', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
          'M365 F1':  { label: 'F1',  bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
          'M365 F3':  { label: 'F3',  bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
          'EMS E3':   { label: 'EMS E3', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
          'EMS E5':   { label: 'EMS E5', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
          'Teams Exploratory': { label: 'Teams', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
          'Power Automate Free': { label: 'Power Automate', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
          'Exchange Plan 1': { label: 'Exchange', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
          'Windows 10/11 Ent E3': { label: 'Win E3', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
        }

        // Garder uniquement les licences avec un affichage défini (nom court)
        const visibleLicenses = resolved.filter(name => licenseDisplay[name])

        return (
          <div className="flex flex-wrap gap-1">
            {visibleLicenses.map((name, i) => {
              const entry = licenseDisplay[name]
              const label = entry?.label ?? name
              const bg = entry?.bg ?? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              return (
                <span key={i} title={name} className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${bg}`}>
                  {label}
                </span>
              )
            })}
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = getAgentStatut(row.original)
        
        if (status === 'actif') {
          return (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={16} />
              <span className="text-xs font-medium text-green-700">Actif</span>
            </div>
          )
        }
        
        if (status === 'futur') {
          return (
            <div className="flex items-center gap-2">
              <Activity className="text-indigo-400" size={16} />
              <span className="text-xs font-medium text-indigo-600">Futur</span>
            </div>
          )
        }

        const label = status === 'parti' ? 'Parti' : 'Inactif'
        return (
          <div className="flex items-center gap-2">
            <XCircle className="text-slate-300" size={16} />
            <span className="text-xs font-medium text-slate-400">{label}</span>
          </div>
        )
      }
    },
    {
      id: 'ad_azure',
      header: () => <div className="text-center">AD / Azure</div>,
      cell: ({ row }) => {
        const adColor = row.original.ad_id ? 'text-green-400' : 'text-[#40485d]'
        const azColor = row.original.azure_id ? 'text-blue-400' : 'text-[#40485d]'
        return (
          <div className="flex items-center justify-center gap-3">
            <div title={row.original.ad_id ? "AD Actif" : "Non lié AD"}>
              <Activity className={adColor} size={18} />
            </div>
            <div title={row.original.azure_id ? "Azure Actif" : "Non lié Azure"}>
              <Activity className={azColor} size={18} />
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { setSelectedAgent(a); setModalOpen(true) }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#a3a6ff]" title="Voir Fiche"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => { setAgentToLink(a); setAdLinkModalOpen(true) }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-green-400" title="Associer AD"
            >
              <Link2 size={16} />
            </button>
            {a.ad_id && (
              <button 
                onClick={() => { setAgentToLink(a); setAdLinkModalOpen(true) }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-red-400" title="Délier / Changer AD"
              >
                <Unlink size={16} />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: agents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Loading skeleton
  if (loading && agents.length === 0) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-12 border-b border-slate-200 bg-slate-50 rounded-t-xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-100 bg-white/80" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="bg-slate-50 border-b border-slate-200">
                  {hg.headers.map(h => (
                    <th 
                      key={h.id} 
                      className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#40485d]/20">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="table-row-hover group bg-white/60">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {agents.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500">Aucun agent trouvé.</div>
          )}
        </div>
      </div>

      <AgentModal agent={selectedAgent} open={modalOpen} onOpenChange={setModalOpen} />
      
      <AdLinkingModal 
        agent={agentToLink}
        open={adLinkModalOpen}
        onOpenChange={setAdLinkModalOpen}
      />
    </>
  )
}

