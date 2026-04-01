'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PositionsPieChartProps {
  data: { name: string, value: number }[]
  activePositions: string[]
}

export function PositionsPieChart({ data, activePositions }: PositionsPieChartProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Top 10 for the small view, maybe all for the large view?
  const displayData = data.slice(0, 10)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const ACTIVE_COLORS = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', 
    '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'
  ]
  const INACTIVE_COLORS = ['#94a3b8', '#cbd5e1', '#e2e8f0', '#94a3b8', '#cbd5e1']

  const getColor = (name: string, index: number) => {
    if (activePositions.length === 0 || activePositions.includes(name)) {
      return ACTIVE_COLORS[index % ACTIVE_COLORS.length]
    }
    return INACTIVE_COLORS[index % INACTIVE_COLORS.length]
  }

  const renderChart = (isLarge = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={isLarge ? data : displayData}
          cx="50%"
          cy="50%"
          innerRadius={isLarge ? 100 : 60}
          outerRadius={isLarge ? 140 : 80}
          paddingAngle={5}
          dataKey="value"
          onClick={() => !isLarge && setIsOpen(true)}
          style={{ cursor: isLarge ? 'default' : 'pointer' }}
        >
          {(isLarge ? data : displayData).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            fontSize: '12px'
          }}
          formatter={(value: number, name: string) => {
            const percent = ((value / total) * 100).toFixed(1)
            return [`${value} agents (${percent}%)`, name]
          }}
        />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{ 
            fontSize: isLarge ? '12px' : '10px', 
            maxWidth: isLarge ? '300px' : '160px', 
            paddingLeft: '10px',
            overflowY: 'auto',
            maxHeight: isLarge ? '400px' : '300px'
          }}
          formatter={(value: string, entry: any) => {
            const item = data.find(d => d.name === value)
            const percent = item ? ((item.value / total) * 100).toFixed(1) : '0'
            return (
              <span className="text-slate-600">
                {value} <span className="text-slate-400">({percent}%)</span>
              </span>
            )
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <>
      <div className="h-full w-full">
        {renderChart(false)}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[70vh]">
          <DialogHeader>
            <DialogTitle>Répartition détaillée des Positions Agents</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 mt-4">
            {renderChart(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
