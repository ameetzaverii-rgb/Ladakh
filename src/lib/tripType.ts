// src/lib/tripType.ts
// Trip "mode" controls how much of the work-from-destination experience shows.
// Leisure hides all work cues; Workation shows everything; Hybrid keeps work
// features but treats work days as optional/per-day.

export type TripType = 'LEISURE' | 'WORKATION' | 'HYBRID'

export interface TripFeatures {
  /** Show work-day markers in the itinerary, legend and daily alert. */
  showWorkDays: boolean
  /** Work days are optional/per-day rather than a core part of the plan. */
  workDaysOptional: boolean
  /** Show the work-setup checklist category (SIM, coworking, WiFi tests…). */
  showWorkChecklist: boolean
  /** Emphasise connectivity (WiFi rating, coworking) on stays. */
  emphasiseConnectivity: boolean
}

const FEATURES: Record<TripType, TripFeatures> = {
  WORKATION: { showWorkDays: true,  workDaysOptional: false, showWorkChecklist: true,  emphasiseConnectivity: true  },
  HYBRID:    { showWorkDays: true,  workDaysOptional: true,  showWorkChecklist: true,  emphasiseConnectivity: true  },
  LEISURE:   { showWorkDays: false, workDaysOptional: false, showWorkChecklist: false, emphasiseConnectivity: false },
}

export const DEFAULT_TRIP_TYPE: TripType = 'WORKATION'

/** Normalise an arbitrary value to a valid TripType. */
export function asTripType(v: unknown): TripType {
  return v === 'LEISURE' || v === 'WORKATION' || v === 'HYBRID' ? v : DEFAULT_TRIP_TYPE
}

/** Derived feature flags for a trip type. */
export function tripFeatures(v: unknown): TripFeatures {
  return FEATURES[asTripType(v)]
}

/** Onboarding picker metadata. */
export const TRIP_TYPE_OPTIONS: { key: TripType; label: string; blurb: string }[] = [
  { key: 'LEISURE',   label: 'Leisure',   blurb: 'Pure travel — sightseeing, no work cues' },
  { key: 'WORKATION', label: 'Workation', blurb: 'Work + explore — work days, coworking & WiFi' },
  { key: 'HYBRID',    label: 'Hybrid',    blurb: 'A bit of both — optional work days' },
]

/** Itinerary hero subtitle, tuned to the mode. */
export function planSubtitle(v: unknown, destName: string): string {
  const t = asTripType(v)
  if (t === 'LEISURE') return `Your day-by-day plan for ${destName}.`
  if (t === 'HYBRID') return `Explore, with the odd work morning — your ${destName} plan.`
  return `Work mornings, explore afternoons — your day-by-day ${destName}.`
}
