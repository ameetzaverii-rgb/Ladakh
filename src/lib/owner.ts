// src/lib/owner.ts
// Per-user ownership (Phase 2b). Personal data (trip config, expenses, journal,
// checklist, bookings) is scoped by `userId`. Anonymous visitors read the shared
// demo (rows where userId IS NULL); signed-in users read/write their own rows.

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { db } from './db'
import { ALL_MENU_KEYS } from './destinations'

/** The signed-in user's id, or null for anonymous (= the shared read-only demo). */
export async function currentOwnerId(): Promise<string | null> {
  const session = await getServerSession(authOptions).catch(() => null)
  return ((session?.user as any)?.id as string | undefined) ?? null
}

/** Is the current viewer the admin? (owner email / ADMIN role) */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions).catch(() => null)
  return (session?.user as any)?.role === 'ADMIN'
}

/**
 * Ensure a signed-in user has their own trip. On first call we clone the shared
 * Ladakh demo's settings and its prep checklist into user-owned rows, so a new
 * user lands on an instantly-useful trip they can then edit.
 */
export async function ensureUserTrip(userId: string) {
  const existing = await db.tripConfig.findFirst({ where: { userId } }).catch(() => null)
  if (existing) return existing

  const demo = await db.tripConfig.findFirst({ where: { userId: null } }).catch(() => null)
  const created = await db.tripConfig.create({
    data: {
      userId,
      activeDestinationId: demo?.activeDestinationId ?? 'ladakh',
      enabledMenus: (demo?.enabledMenus as any) ?? ALL_MENU_KEYS,
      onboarded: true,
      tripType: demo?.tripType ?? 'LEISURE',
      tripStartDate: demo?.tripStartDate ?? undefined,
      tripEndDate: demo?.tripEndDate ?? undefined,
      totalBudgetINR: demo?.totalBudgetINR ?? 150000,
      travelerName: demo?.travelerName ?? undefined,
      categoryBudgets: (demo?.categoryBudgets as any) ?? undefined,
    },
  })

  // Clone the destination's prep checklist (the shared template) for this user.
  const destId = created.activeDestinationId ?? 'ladakh'
  const template = await db.checklistItem
    .findMany({ where: { userId: null, destinationId: destId } })
    .catch(() => [])
  if (template.length) {
    await db.checklistItem.createMany({
      data: template.map(t => ({
        title: t.title, category: t.category, phase: t.phase, dueDate: t.dueDate,
        completed: false, notes: t.notes, priority: t.priority,
        bookingRef: null, costINR: t.costINR, url: t.url,
        destinationId: t.destinationId, userId,
      })),
    }).catch(() => {})
  }

  return created
}

/**
 * The TripConfig that drives the current viewer's experience: their own (created
 * on demand) when signed in, or the shared demo when anonymous.
 */
export async function resolveTripConfig() {
  const ownerId = await currentOwnerId()
  if (ownerId) return ensureUserTrip(ownerId)
  return db.tripConfig.findFirst({ where: { userId: null } }).catch(() => null)
}
