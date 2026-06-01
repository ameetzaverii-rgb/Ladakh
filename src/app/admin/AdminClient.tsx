'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { formatINR } from '@/lib/utils'

type Tab = 'config' | 'flights' | 'stays' | 'treks' | 'events' | 'transport' | 'places' | 'checklist'

const TABS: { key: Tab; label: string }[] = [
  { key: 'config', label: 'Trip Config' },
  { key: 'flights', label: 'Flights' },
  { key: 'stays', label: 'Stays' },
  { key: 'treks', label: 'Treks' },
  { key: 'events', label: 'Events' },
  { key: 'transport', label: 'Transport' },
  { key: 'places', label: 'Food/Cafés' },
  { key: 'checklist', label: 'Checklist' },
]

export function AdminClient({ flights, stays, treks, events, transport, places, checklist, config }: any) {
  const [tab, setTab] = useState<Tab>('config')
  const router = useRouter()

  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-6 border-b border-gold/15 pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 font-mono text-[0.6rem] tracking-wider uppercase transition-all rounded-sm ${
              tab === t.key ? 'bg-gold/20 text-gold' : 'text-stone hover:text-gold'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && <TripConfigEditor config={config} />}
      {tab === 'flights' && <FlightAdmin rows={flights} />}
      {tab === 'stays' && <StayAdmin rows={stays} />}
      {tab === 'treks' && <TrekAdmin rows={treks} />}
      {tab === 'events' && <EventAdmin rows={events} />}
      {tab === 'transport' && <TransportAdmin rows={transport} />}
      {tab === 'places' && <PlaceAdmin rows={places} />}
      {tab === 'checklist' && <ChecklistAdmin rows={checklist} />}
    </div>
  )
}

function TripConfigEditor({ config }: { config: any }) {
  const [startDate, setStartDate] = useState(
    config?.tripStartDate ? format(new Date(config.tripStartDate), 'yyyy-MM-dd') : '2026-07-22'
  )
  const [endDate, setEndDate] = useState(
    config?.tripEndDate ? format(new Date(config.tripEndDate), 'yyyy-MM-dd') : '2026-08-11'
  )
  const [budget, setBudget] = useState(String(config?.totalBudgetINR ?? 150000))
  const [name, setName] = useState(config?.travelerName ?? 'Amit')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    const url = config ? `/api/tripconfig/${config.id}` : '/api/tripconfig'
    const method = config ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripStartDate: new Date(startDate).toISOString(),
        tripEndDate: new Date(endDate).toISOString(),
        totalBudgetINR: parseInt(budget),
        travelerName: name,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Trip config saved!')
      router.refresh()
    } else {
      toast.error('Failed to save config')
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="label-mono text-xs text-gold mb-4">Trip Settings</div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Your Name', value: name, set: setName, type: 'text', placeholder: 'Amit' },
          { label: 'Total Budget ₹', value: budget, set: setBudget, type: 'number', placeholder: '150000' },
          { label: 'Trip Start Date', value: startDate, set: setStartDate, type: 'date', placeholder: '' },
          { label: 'Trip End Date', value: endDate, set: setEndDate, type: 'date', placeholder: '' },
        ].map(field => (
          <div key={field.label}>
            <label className="label-mono text-[0.55rem] block mb-1">{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={e => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={loading}
        className="px-6 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-mono text-xs tracking-wider uppercase transition-all disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Config'}
      </button>
    </div>
  )
}

function GenericTable({
  title, rows, columns, endpoint, renderRow, renderForm
}: {
  title: string
  rows: any[]
  columns: string[]
  endpoint: string
  renderRow: (row: any) => React.ReactNode[]
  renderForm: (onClose: () => void, editData?: any) => React.ReactNode
}) {
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="label-mono text-xs text-gold">{title} ({rows.length})</div>
        <button onClick={() => { setShowForm(true); setEditData(null) }}
          className="pill pill-sky">+ Add</button>
      </div>
      {(showForm || editData) && renderForm(() => { setShowForm(false); setEditData(null) }, editData)}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gold/20">
              {columns.map(col => (
                <th key={col} className="label-mono text-[0.55rem] text-gold text-left py-2 px-2">{col}</th>
              ))}
              <th className="label-mono text-[0.55rem] text-gold text-left py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-gold/5 hover:bg-white/[0.02]">
                {renderRow(row).map((cell, i) => (
                  <td key={i} className="py-2 px-2 text-muted">{cell}</td>
                ))}
                <td className="py-2 px-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditData(row); setShowForm(false) }}
                      className="label-mono text-[0.55rem] text-sky hover:underline">Edit</button>
                    <button onClick={() => handleDelete(row.id)}
                      className="label-mono text-[0.55rem] text-rust hover:underline">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FlightAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Flights"
      rows={rows}
      columns={['Airline', 'Route', 'Time', 'Duration', 'Price', 'Available']}
      endpoint="flights"
      renderRow={r => [
        r.airline,
        `${r.origin}→${r.destination}`,
        r.departureTime,
        `${r.durationMins}m`,
        <span className="text-gold">₹{r.priceINR.toLocaleString()}</span>,
        r.available ? <span className="text-sage">Yes</span> : <span className="text-rust">No</span>,
      ]}
      renderForm={(onClose, data) => <FlightForm onClose={onClose} data={data} />}
    />
  )
}

function FlightForm({ onClose, data }: { onClose: () => void; data?: any }) {
  const [fields, setFields] = useState({
    origin: data?.origin ?? 'DEL',
    destination: data?.destination ?? 'IXL',
    airline: data?.airline ?? '',
    flightNumber: data?.flightNumber ?? '',
    departureTime: data?.departureTime ?? '07:30',
    durationMins: String(data?.durationMins ?? 75),
    priceINR: String(data?.priceINR ?? 9000),
    available: data?.available ?? true,
    bookingUrl: data?.bookingUrl ?? '',
    notes: data?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const save = async () => {
    setLoading(true)
    const url = data ? `/api/flights/${data.id}` : '/api/flights'
    const method = data ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, durationMins: parseInt(fields.durationMins), priceINR: parseInt(fields.priceINR) }),
    })
    setLoading(false)
    if (res.ok) { toast.success('Saved!'); onClose(); router.refresh() }
    else toast.error('Failed')
  }

  const Field = ({ k, label, type = 'text' }: { k: string; label: string; type?: string }) => (
    <div>
      <label className="label-mono text-[0.5rem] block mb-0.5">{label}</label>
      <input type={type} value={(fields as any)[k]} onChange={e => setFields(f => ({ ...f, [k]: e.target.value }))}
        className="w-full bg-dark border border-gold/20 text-cream px-2 py-1.5 text-xs focus:border-gold/50 outline-none" />
    </div>
  )

  return (
    <div className="card-base p-4 mb-4">
      <div className="grid md:grid-cols-4 gap-2 mb-3">
        <Field k="airline" label="Airline" />
        <Field k="flightNumber" label="Flight #" />
        <Field k="origin" label="Origin" />
        <Field k="destination" label="Destination" />
        <Field k="departureTime" label="Departure" />
        <Field k="durationMins" label="Duration (mins)" type="number" />
        <Field k="priceINR" label="Price ₹" type="number" />
        <Field k="bookingUrl" label="Booking URL" />
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={loading}
          className="px-4 py-1.5 bg-gold/20 border border-gold/40 text-gold font-mono text-xs uppercase">
          {loading ? '...' : 'Save'}
        </button>
        <button onClick={onClose} className="px-4 py-1.5 border border-gold/10 text-stone font-mono text-xs uppercase">Cancel</button>
      </div>
    </div>
  )
}

function StayAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Stays"
      rows={rows}
      columns={['Name', 'Type', 'Location', 'Price/Night', 'WiFi', 'Coworking']}
      endpoint="stays"
      renderRow={r => [
        r.name,
        r.type,
        r.neighbourhood,
        <span className="text-gold">₹{r.pricePerNightINR.toLocaleString()}</span>,
        '★'.repeat(r.wifiRating),
        r.hasCoworking ? <span className="text-sage">Yes</span> : '—',
      ]}
      renderForm={(onClose, data) => (
        <SimpleJsonForm
          onClose={onClose}
          endpoint="stays"
          data={data}
          fields={[
            { k: 'name', label: 'Name' },
            { k: 'neighbourhood', label: 'Neighbourhood' },
            { k: 'pricePerNightINR', label: 'Price/Night ₹', type: 'number' },
            { k: 'wifiRating', label: 'WiFi Rating 1-5', type: 'number' },
            { k: 'description', label: 'Description', multiline: true },
            { k: 'bookingUrl', label: 'Booking URL' },
          ]}
          defaults={{ type: 'HOTEL', wifiRating: 3, hasCoworking: false, hasPowerBackup: true, available: true, highlights: [], description: '' }}
        />
      )}
    />
  )
}

function TrekAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Treks"
      rows={rows}
      columns={['Name', 'Difficulty', 'Days', 'Max Alt', 'Price', 'Company']}
      endpoint="treks"
      renderRow={r => [r.name, r.difficulty, r.durationDays, `${r.maxAltitudeM}m`, <span className="text-gold">₹{r.priceINR.toLocaleString()}</span>, r.company ?? '—']}
      renderForm={(onClose, data) => (
        <SimpleJsonForm onClose={onClose} endpoint="treks" data={data}
          fields={[
            { k: 'name', label: 'Name' },
            { k: 'maxAltitudeM', label: 'Max Altitude (m)', type: 'number' },
            { k: 'durationDays', label: 'Duration (days)', type: 'number' },
            { k: 'priceINR', label: 'Price ₹', type: 'number' },
            { k: 'startPoint', label: 'Start Point' },
            { k: 'company', label: 'Company' },
            { k: 'description', label: 'Description', multiline: true },
          ]}
          defaults={{ difficulty: 'MEDIUM', available: true, highlights: [], season: 'June–September', permitRequired: false }}
        />
      )}
    />
  )
}

function EventAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Events"
      rows={rows}
      columns={['Name', 'Type', 'Start Date', 'Location', 'Free']}
      endpoint="events"
      renderRow={r => [r.name, r.type, format(new Date(r.startDate), 'MMM d'), r.location, r.freeEntry ? <span className="text-sage">Free</span> : '—']}
      renderForm={(onClose, data) => (
        <SimpleJsonForm onClose={onClose} endpoint="events" data={data}
          fields={[
            { k: 'name', label: 'Event Name' },
            { k: 'location', label: 'Location' },
            { k: 'startDate', label: 'Start Date', type: 'date' },
            { k: 'endDate', label: 'End Date', type: 'date' },
            { k: 'distanceFromLehKm', label: 'Distance from Leh (km)', type: 'number' },
            { k: 'tips', label: 'Tips' },
            { k: 'description', label: 'Description', multiline: true },
          ]}
          defaults={{ type: 'FESTIVAL', freeEntry: true, ticketRequired: false }}
        />
      )}
    />
  )
}

function TransportAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Transport"
      rows={rows}
      columns={['Destination', 'Type', 'Rate', 'Rate Type', 'Permit']}
      endpoint="transport"
      renderRow={r => [r.destination, r.type, <span className="text-gold">₹{r.rateINR.toLocaleString()}</span>, r.rateType, r.permitRequired ? <span className="text-rust">Yes</span> : '—']}
      renderForm={(onClose, data) => (
        <SimpleJsonForm onClose={onClose} endpoint="transport" data={data}
          fields={[
            { k: 'destination', label: 'Destination' },
            { k: 'distanceKm', label: 'Distance km', type: 'number' },
            { k: 'rateINR', label: 'Rate ₹', type: 'number' },
            { k: 'rateType', label: 'Rate Type (one-way/per-day/2-day)' },
            { k: 'durationHours', label: 'Duration hours', type: 'number' },
            { k: 'notes', label: 'Notes' },
          ]}
          defaults={{ type: 'TAXI', permitRequired: false, permitTypes: [], available: true }}
        />
      )}
    />
  )
}

function PlaceAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Food & Cafés"
      rows={rows}
      columns={['Name', 'Type', 'Neighbourhood', 'Budget', 'Laptop']}
      endpoint="places"
      renderRow={r => [r.name, r.type, r.neighbourhood, r.avgBudgetINR ? `₹${r.avgBudgetINR}` : '—', r.laptopFriendly ? '✓' : '—']}
      renderForm={(onClose, data) => (
        <SimpleJsonForm onClose={onClose} endpoint="places" data={data}
          fields={[
            { k: 'name', label: 'Name' },
            { k: 'neighbourhood', label: 'Neighbourhood' },
            { k: 'avgBudgetINR', label: 'Avg Budget ₹', type: 'number' },
            { k: 'description', label: 'Description', multiline: true },
          ]}
          defaults={{ type: 'CAFE', wifiAvailable: false, laptopFriendly: false, openNow: true, seasonal: true, mustOrder: [], tags: [] }}
        />
      )}
    />
  )
}

function ChecklistAdmin({ rows }: { rows: any[] }) {
  return (
    <GenericTable
      title="Checklist Items"
      rows={rows}
      columns={['Title', 'Category', 'Phase', 'Done', 'Cost']}
      endpoint="checklist"
      renderRow={r => [
        r.title,
        r.category,
        r.phase,
        r.completed ? <span className="text-sage">✓</span> : '—',
        r.costINR ? `₹${r.costINR.toLocaleString()}` : '—',
      ]}
      renderForm={(onClose, data) => (
        <SimpleJsonForm onClose={onClose} endpoint="checklist" data={data}
          fields={[
            { k: 'title', label: 'Title' },
            { k: 'notes', label: 'Notes' },
            { k: 'bookingRef', label: 'Booking Ref' },
            { k: 'costINR', label: 'Cost ₹', type: 'number' },
            { k: 'url', label: 'URL' },
          ]}
          defaults={{ category: 'MISC', phase: 'MONTH_BEFORE', priority: 2, completed: false }}
        />
      )}
    />
  )
}

function SimpleJsonForm({
  onClose, endpoint, data, fields, defaults
}: {
  onClose: () => void
  endpoint: string
  data?: any
  fields: { k: string; label: string; type?: string; multiline?: boolean }[]
  defaults: Record<string, any>
}) {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, f) => {
      acc[f.k] = data?.[f.k] ?? defaults[f.k] ?? ''
      return acc
    }, {} as Record<string, any>)
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const save = async () => {
    setLoading(true)
    const payload = { ...defaults, ...values }
    // Convert date strings to ISO
    fields.forEach(f => {
      if (f.type === 'date' && payload[f.k]) {
        payload[f.k] = new Date(payload[f.k]).toISOString()
      }
      if (f.type === 'number' && payload[f.k] !== '' && payload[f.k] !== null) {
        payload[f.k] = Number(payload[f.k])
      }
    })
    const url = data ? `/api/${endpoint}/${data.id}` : `/api/${endpoint}`
    const method = data ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) { toast.success('Saved!'); onClose(); router.refresh() }
    else toast.error('Failed to save')
  }

  return (
    <div className="card-base p-4 mb-4">
      <div className="grid md:grid-cols-3 gap-2 mb-3">
        {fields.map(f => (
          <div key={f.k} className={f.multiline ? 'md:col-span-3' : ''}>
            <label className="label-mono text-[0.5rem] block mb-0.5">{f.label}</label>
            {f.multiline ? (
              <textarea
                value={values[f.k] ?? ''}
                onChange={e => setValues(v => ({ ...v, [f.k]: e.target.value }))}
                rows={3}
                className="w-full bg-dark border border-gold/20 text-cream px-2 py-1.5 text-xs focus:border-gold/50 outline-none resize-none"
              />
            ) : (
              <input
                type={f.type ?? 'text'}
                value={values[f.k] ?? ''}
                onChange={e => setValues(v => ({ ...v, [f.k]: e.target.value }))}
                className="w-full bg-dark border border-gold/20 text-cream px-2 py-1.5 text-xs focus:border-gold/50 outline-none"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={loading}
          className="px-4 py-1.5 bg-gold/20 border border-gold/40 text-gold font-mono text-xs uppercase hover:bg-gold/30 transition-all">
          {loading ? '...' : 'Save'}
        </button>
        <button onClick={onClose}
          className="px-4 py-1.5 border border-gold/10 text-stone font-mono text-xs uppercase hover:text-gold transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}
