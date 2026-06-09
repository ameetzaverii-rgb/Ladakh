import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const destinations = await db.destination.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(destinations)
}

// Create a custom destination (build-your-own).
export async function POST(req: NextRequest) {
  const body = await req.json()
  const name: string = (body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'trip'
  // Ensure the slug is unique.
  let slug = baseSlug
  for (let i = 2; await db.destination.findUnique({ where: { slug } }); i++) slug = `${baseSlug}-${i}`

  const max = await db.destination.aggregate({ _max: { sortOrder: true } })
  const dest = await db.destination.create({
    data: {
      slug, name,
      tagline: body.tagline ?? '',
      region: body.region ?? '',
      color: body.color ?? 'blue',
      heroWiki: Array.isArray(body.heroWiki) ? body.heroWiki : (body.heroWiki ? [body.heroWiki] : [name]),
      heroSrc: body.heroSrc ?? null,
      lat: typeof body.lat === 'number' ? body.lat : 0,
      lng: typeof body.lng === 'number' ? body.lng : 0,
      currency: body.currency ?? 'INR',
      intro: body.intro ?? null,
      isCustom: true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  })
  return NextResponse.json(dest, { status: 201 })
}
