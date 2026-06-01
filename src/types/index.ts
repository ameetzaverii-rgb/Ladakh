// src/types/index.ts
// Shared TypeScript types for the Leh Ladakh Guide

import type { 
  Flight, Stay, Trek, Event, Transport, Place, ItineraryDay,
  StayType, TrekDifficulty, EventType, TransportType, PlaceType 
} from '@prisma/client'

// Re-export Prisma types
export type { Flight, Stay, Trek, Event, Transport, Place, ItineraryDay }
export type { StayType, TrekDifficulty, EventType, TransportType, PlaceType }

// API response wrappers
export type FlightsResponse = { flights: Flight[]; total: number }
export type StaysResponse = { stays: Stay[]; total: number }
export type TreksResponse = { treks: Trek[]; total: number }
export type EventsResponse = { events: Event[]; total: number }
export type TransportResponse = { transport: Transport[]; total: number }

// UI helper types
export type NavTab = 'overview' | 'stays' | 'itinerary' | 'treks' | 'food' | 'transport' | 'mustdo' | 'essentials'

export type PriceRange = {
  min: number
  max: number
  label: string
}

export type AlertLevel = 'info' | 'warning' | 'critical'

export type TravelAlert = {
  id: string
  level: AlertLevel
  title: string
  message: string
  affectedSection: NavTab | 'all'
  createdAt: string
}
