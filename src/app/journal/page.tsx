import { db } from '@/lib/db'
import { JournalClient } from './JournalClient'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { activeDestinationId } from '@/lib/destination'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'
export default async function JournalPage() {
  const [entries, heroImg] = await Promise.all([
    db.journalEntry.findMany({ where: { destinationId: await activeDestinationId() }, orderBy: { date: 'desc' } }),
    getCategoryImage('journal'),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="ink" icon={BookOpen}
        title="The Journal" subtitle="Daily notes from the road. Add entries as you go." />
      <JournalClient entries={entries} />
    </div>
  )
}
