"use client"

import { useState } from 'react'
import BiaShell, { badgeToneForStatus } from '@/components/bia/BiaShell'
import { factories as initialFactories } from '@/lib/bia-data'

const emptyForm = { name: '', code: '', location: '', description: '', manager: '', status: 'Actif' }

export default function FactoriesPage() {
  const [factories, setFactories] = useState(initialFactories)
  const [search, setSearch] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = factories.filter((factory) =>
    `${factory.name} ${factory.code} ${factory.location}`.toLowerCase().includes(search.toLowerCase()),
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(factory) {
    setEditingId(factory.id)
    setForm(factory)
    setModalOpen(true)
  }

  function handleDelete(id) {
    setFactories((current) => current.filter((factory) => factory.id !== id))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (editingId) {
      setFactories((current) => current.map((factory) => (factory.id === editingId ? { ...form, id: editingId } : factory)))
    } else {
      const id = form.code ? form.code.toLowerCase().replace(/\s+/g, '-') : `usine-${Date.now()}`
      setFactories((current) => [...current, { ...form, id }])
    }
    setModalOpen(false)
  }

  return (
    <BiaShell
      active="factories"
      title="Usines"
      subtitle="Gestion des sites industriels et logistiques couverts par le BCM."
      actions={(
        <button
          className="flex items-center gap-2 rounded-lg bg-[#00236f] px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          onClick={openCreate}
          type="button"
        >
          <span className="material-symbols-outlined">add</span>
          Nouvelle usine
        </button>
      )}
    >
      <div className="flex items-center gap-3">
        <div className="group relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]">search</span>
          <input
            className="w-full rounded-full border border-[#c5c5d3] bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une usine..."
            type="text"
            value={search}
          />
        </div>
        <span className="text-[13px] font-semibold text-[#757682]">{filtered.length} usine(s)</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((factory) => (
          <div key={factory.id} className="flex flex-col rounded-xl border border-[#c5c5d3] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00236f]/10 text-[#00236f]">
                <span className="material-symbols-outlined">factory</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badgeToneForStatus(factory.status)}`}>
                {factory.status}
              </span>
            </div>
            <h3 className="text-[16px] font-bold leading-6">{factory.name}</h3>
            <p className="text-[12px] font-semibold text-[#757682]">{factory.code} · {factory.location}</p>
            <p className="mt-3 flex-1 text-[13px] leading-5 text-[#444651]">{factory.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-[#e6e8ea] pt-4">
              <div className="flex items-center gap-2 text-[13px] text-[#444651]">
                <span className="material-symbols-outlined text-[16px] text-[#757682]">person</span>
                {factory.manager}
              </div>
              <div className="flex items-center gap-3">
                <button className="text-[13px] font-semibold text-[#00236f] hover:underline" onClick={() => openEdit(factory)} type="button">
                  Modifier
                </button>
                <button className="text-[13px] font-semibold text-[#ba1a1a] hover:underline" onClick={() => handleDelete(factory.id)} type="button">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold leading-7">{editingId ? "Modifier l'usine" : 'Nouvelle usine'}</h3>
              <button onClick={() => setModalOpen(false)} type="button">
                <span className="material-symbols-outlined text-[#757682]">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Nom
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    value={form.name}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Code
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                    required
                    value={form.code}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Statut
                  <select
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                    value={form.status}
                  >
                    <option>Actif</option>
                    <option>En maintenance</option>
                    <option>Fermé</option>
                  </select>
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Localisation
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                    required
                    value={form.location}
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Responsable
                  <input
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, manager: event.target.value })}
                    value={form.manager}
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-[13px] font-semibold text-[#444651]">
                  Description
                  <textarea
                    className="rounded-lg border border-[#c5c5d3] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00236f]"
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    rows={3}
                    value={form.description}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#e6e8ea] pt-4">
                <button
                  className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#444651] hover:bg-[#e6e8ea]"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Annuler
                </button>
                <button className="rounded-lg bg-[#00236f] px-4 py-2 text-[14px] font-bold text-white hover:shadow-md" type="submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BiaShell>
  )
}
