'use client'

import { useEffect, useRef } from 'react'

export interface MapDay {
  dayNumber: number
  title: string
  name: string
  lat: number
  lng: number
}

declare global {
  interface Window {
    L?: any
  }
}

// Load Leaflet from CDN once (no npm dependency, no API key).
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.L) return resolve(window.L)

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L))
      existing.addEventListener('error', reject)
      if (window.L) resolve(window.L)
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

interface LocationGroup {
  name: string
  lat: number
  lng: number
  days: MapDay[]
}

export function ItineraryMap({ days }: { days: MapDay[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    // Group days that share the same coordinates (e.g. all the Leh-based days).
    const groups = new Map<string, LocationGroup>()
    for (const d of days) {
      const key = `${d.lat},${d.lng}`
      const g = groups.get(key)
      if (g) g.days.push(d)
      else groups.set(key, { name: d.name, lat: d.lat, lng: d.lng, days: [d] })
    }

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView([34.2, 77.6], 8)
        mapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 17,
        }).addTo(map)

        const allLatLng: [number, number][] = []

        groups.forEach((g) => {
          allLatLng.push([g.lat, g.lng])
          const isBase = /leh/i.test(g.name)
          const label =
            g.days.length > 1 ? `${g.days.length}` : `${g.days[0].dayNumber}`
          const color = isBase ? '#c9993a' : '#b85c38'

          const icon = L.divIcon({
            className: '',
            html:
              `<div style="background:${color};color:#1a1208;border:2px solid #f5ede0;` +
              `border-radius:50%;width:28px;height:28px;display:flex;align-items:center;` +
              `justify-content:center;font-size:12px;font-weight:700;` +
              `box-shadow:0 1px 6px rgba(0,0,0,.6)">${label}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })

          const dayList = g.days
            .map((d) => `<div style="margin-top:2px">Day ${d.dayNumber}: ${d.title}</div>`)
            .join('')

          L.marker([g.lat, g.lng], { icon })
            .addTo(map)
            .bindPopup(
              `<div style="font-family:sans-serif;min-width:160px">` +
                `<strong style="color:#b85c38">📍 ${g.name}</strong>${dayList}</div>`
            )
        })

        if (allLatLng.length > 0) {
          map.fitBounds(L.latLngBounds(allLatLng).pad(0.25))
        }

        // Force a redraw once the container has its final size.
        setTimeout(() => map.invalidateSize(), 200)
      })
      .catch(() => {
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8b7355;font-size:0.8rem">Map could not load — check your connection.</div>'
        }
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [days])

  return (
    <div
      ref={containerRef}
      className="w-full h-[380px] rounded-md border border-gold/15 overflow-hidden z-0"
      style={{ background: '#0f0b06' }}
    />
  )
}
