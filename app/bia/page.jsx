"use client"

import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import BiaShell, { badgeToneForCriticality, badgeToneForStatus } from '@/components/bia/BiaShell'
import { biaReports, computeDashboardMetrics, getCriticality, getFactoryById, getProcessById } from '@/lib/bia-data'

const criticalityColors = {
  Critique: '#ba1a1a',
  Majeur: '#c98a00',
  Modéré: '#00236f',
  Mineur: '#006b5f',
}

function KpiCard({ icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tone}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#191c1e]">{value}</div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-[#757682]">{label}</div>
      </div>
    </div>
  )
}

export default function BiaDashboardPage() {
  const metrics = computeDashboardMetrics()
  const recentBia = [...biaReports].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <BiaShell
      active="dashboard"
      title="Business Impact Analysis"
      subtitle="Vue d'ensemble des analyses d'impact métier et de la criticité des processus."
      actions={(
        <Link
          className="flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          href="/bia/new"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nouveau BIA
        </Link>
      )}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon="fact_check" label="Analyses BIA" value={metrics.totalBia} tone="bg-[#00236f]/10 text-[#00236f]" />
        <KpiCard icon="warning" label="Processus critiques" value={metrics.criticalProcesses} tone="bg-[#ba1a1a]/10 text-[#ba1a1a]" />
        <KpiCard icon="factory" label="Usines couvertes" value={metrics.factoriesCovered} tone="bg-[#006b5f]/10 text-[#006b5f]" />
        <KpiCard icon="task_alt" label="Analyses terminées" value={`${metrics.completionRate}%`} tone="bg-[#6df5e1]/40 text-[#006f64]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-[18px] font-semibold leading-7">Évolution du score de résilience</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={metrics.evolution}>
                <CartesianGrid stroke="#e6e8ea" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} tick={{ fontSize: 12, fill: '#757682' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#757682' }} width={30} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#c5c5d3', fontSize: 12 }} />
                <Line dataKey="score" dot={{ r: 4 }} stroke="#00236f" strokeWidth={2.5} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-[18px] font-semibold leading-7">Répartition par criticité</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={metrics.distribution}>
                <CartesianGrid stroke="#e6e8ea" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="level" tickLine={false} tick={{ fontSize: 11, fill: '#757682' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#757682' }} width={24} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#c5c5d3', fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {metrics.distribution.map((entry) => (
                    <Cell key={entry.level} fill={criticalityColors[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#c5c5d3] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c5c5d3] p-6">
          <h3 className="text-[18px] font-semibold leading-7">Analyses BIA récentes</h3>
          <Link className="text-[14px] font-semibold text-[#00236f] hover:underline" href="/bia/processes">
            Voir tous les processus
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#c5c5d3] text-[12px] uppercase tracking-wide text-[#757682]">
                <th className="px-6 py-3 font-semibold">Processus</th>
                <th className="px-6 py-3 font-semibold">Usine</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Criticité</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentBia.map((bia) => {
                const process = getProcessById(bia.processId)
                const factory = process ? getFactoryById(process.factoryId) : null
                const criticality = getCriticality(bia.globalScore)
                return (
                  <tr key={bia.id} className="border-b border-[#e6e8ea] last:border-0 hover:bg-[#f2f4f6]">
                    <td className="px-6 py-4 font-medium">{process?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-[#444651]">{factory?.name ?? '—'}</td>
                    <td className="px-6 py-4 font-bold text-[#191c1e]">{bia.globalScore}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForCriticality(criticality)}`}>
                        {criticality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${badgeToneForStatus(bia.status)}`}>
                        {bia.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#757682]">{bia.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link className="font-semibold text-[#00236f] hover:underline" href={`/bia/${bia.id}`}>
                        Voir
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </BiaShell>
  )
}
