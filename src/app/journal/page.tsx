import { db } from '@/lib/db'
import { JournalClient } from './JournalClient'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImageFor } from '@/lib/imagery'
import { getActiveContext } from '@/lib/destination'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'
export default async function JournalPage() {
  const ctx = await getActiveContext()
  const [entries, heroImg] = await Promise.all([
    db.journalEntry.findMany({ where: { destinationId: ctx.dest?.id ?? 'ladakh' }, orderBy: { date: 'desc' } }),
    getCategoryImageFor('journal', ctx.dest?.slug, ctx.dest?.heroWiki),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="ink" icon={BookOpen}
        title="The Journal" subtitle="Daily notes from the road. Add entries as you go." />
      <JournalClient entries={entries} />
    </div>
  )
}
