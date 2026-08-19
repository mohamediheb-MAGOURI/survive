"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import BiaShell, { badgeToneForCriticality } from '@/components/bia/BiaShell'
import { biaApi } from '@/lib/bia-api'

function gapTone(gap) {
  if (gap >= 30) return 'Critique'
  if (gap >= 15) return 'Majeur'
  if (gap >= 5) return 'Modéré'
  return 'Mineur'
}

function percentage(value) {
  return Math.min(100, Math.max(0, Number(value) || 0))
}

function MetricCard({ icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#c5c5d3] bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#191c1e]">{value}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#757682]">{label}</div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#aeb1bf] bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#00236f]/10 text-[#00236f]">
        <span className="material-symbols-outlined text-[28px]">compare_arrows</span>
      </div>
      <h3 className="mt-4 text-[18px] font-bold text-[#191c1e]">Aucun écart identifié</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-[#757682]">
        Les écarts de résilience apparaîtront ici dès qu’une analyse BIA aura été enregistrée et qu’un niveau actuel et un niveau cible auront été définis.
      </p>
      <Link className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95" href="/bia/new">
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Créer un BIA
      </Link>
    </div>
  )
}

export default function GapAnalysisPage() {
  const [gapAnalyses, setGapAnalyses] = useState([])
  const [processes, setProcesses] = useState([])
  const [factories, setFactories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([biaApi('/gaps'), biaApi('/processes'), biaApi('/factories')])
      .then(([gaps, processRows, factoryRows]) => {
        setGapAnalyses(Array.isArray(gaps) ? gaps : [])
        setProcesses(Array.isArray(processRows) ? processRows : [])
        setFactories(Array.isArray(factoryRows) ? factoryRows : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const metrics = useMemo(() => {
    const deltas = gapAnalyses.map((gap) => Math.max(0, Number(gap.expectedLevel || 0) - Number(gap.currentLevel || 0)))
    const averageCurrent = gapAnalyses.length
      ? Math.round(gapAnalyses.reduce((total, gap) => total + percentage(gap.currentLevel), 0) / gapAnalyses.length)
      : 0
    const averageExpected = gapAnalyses.length
      ? Math.round(gapAnalyses.reduce((total, gap) => total + percentage(gap.expectedLevel), 0) / gapAnalyses.length)
      : 0
    return {
      total: gapAnalyses.length,
      averageCurrent,
      averageExpected,
      critical: deltas.filter((delta) => gapTone(delta) === 'Critique').length,
    }
  }, [gapAnalyses])

  const getProcessById = (id) => processes.find((item) => item.id === id)
  const getFactoryById = (id) => factories.find((item) => item.id === id)

  return (
    <BiaShell
      active="gap"
      title="Gap Analysis"
      subtitle="Comparaison entre la situation actuelle et le niveau de résilience attendu."
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les écarts de résilience : {error}
        </div>
      ) : isLoading ? (
        <div className="space-y-6" aria-live="polite">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-[#e6e8ea]" />)}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-[#e6e8ea]" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon="compare_arrows" label="Écarts suivis" value={metrics.total} tone="bg-[#00236f]/10 text-[#00236f]" />
            <MetricCard icon="monitoring" label="Niveau actuel moyen" value={`${metrics.averageCurrent}%`} tone="bg-[#757682]/10 text-[#444651]" />
            <MetricCard icon="target" label="Niveau attendu moyen" value={`${metrics.averageExpected}%`} tone="bg-[#006b5f]/10 text-[#006b5f]" />
            <MetricCard icon="warning" label="Écarts critiques" value={metrics.critical} tone="bg-[#ba1a1a]/10 text-[#ba1a1a]" />
          </div>

          {gapAnalyses.length === 0 ? <EmptyState /> : (
            <div className="space-y-6">
              {gapAnalyses.map((gap) => {
                const process = getProcessById(gap.processId)
                const factory = getFactoryById(gap.factoryId || process?.factoryId)
                const currentLevel = percentage(gap.currentLevel)
                const expectedLevel = percentage(gap.expectedLevel)
                const delta = Math.max(0, expectedLevel - currentLevel)
                const tone = gapTone(delta)
                const risks = Array.isArray(gap.risks) && gap.risks.length ? gap.risks : ['Aucun risque détaillé pour cet écart.']
                const recommendations = Array.isArray(gap.recommendations) && gap.recommendations.length ? gap.recommendations : ['Aucune recommandation enregistrée.']

                return (
                  <article key={gap.id} className="rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Processus métier</p>
                        <h3 className="mt-1 text-[18px] font-bold text-[#191c1e]">{process?.name ?? 'Processus non renseigné'}</h3>
                        <p className="mt-1 text-[13px] font-semibold text-[#757682]">{factory?.name ?? 'Usine non renseignée'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${badgeToneForCriticality(tone)}`}>
                          Écart : {delta} pts · {tone}
                        </span>
                        {gap.processId && <Link className="text-[13px] font-semibold text-[#00236f] hover:underline" href={`/bia/new?processId=${gap.processId}`}>Voir le BIA</Link>}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <div className="mb-2 flex justify-between text-[12px] font-semibold text-[#444651]"><span>Situation actuelle</span><span>{currentLevel}%</span></div>
                        <div className="h-2.5 w-full rounded-full bg-[#e6e8ea]"><div className="h-full rounded-full bg-[#757682] transition-all" style={{ width: `${currentLevel}%` }} /></div>
                      </div>
                      <div>
                        <div className="mb-2 flex justify-between text-[12px] font-semibold text-[#444651]"><span>Niveau attendu</span><span>{expectedLevel}%</span></div>
                        <div className="h-2.5 w-full rounded-full bg-[#e6e8ea]"><div className="h-full rounded-full bg-[#00236f] transition-all" style={{ width: `${expectedLevel}%` }} /></div>
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-6 border-t border-[#e6e8ea] pt-6 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#ba1a1a]"><span className="material-symbols-outlined text-[17px]">warning</span>Risques identifiés</h4>
                        <ul className="space-y-2">
                          {risks.map((risk, index) => <li key={`${risk}-${index}`} className="flex items-start gap-2 text-[14px] leading-5 text-[#444651]"><span className="mt-0.5 text-[#ba1a1a]">•</span>{risk}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#006b5f]"><span className="material-symbols-outlined text-[17px]">lightbulb</span>Recommandations</h4>
                        <ul className="space-y-2">
                          {recommendations.map((recommendation, index) => <li key={`${recommendation}-${index}`} className="flex items-start gap-2 text-[14px] leading-5 text-[#444651]"><span className="mt-0.5 text-[#006b5f]">•</span>{recommendation}</li>)}
                        </ul>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </BiaShell>
  )
}
