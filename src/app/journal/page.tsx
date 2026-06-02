import { db } from '@/lib/db'
import { format } from 'date-fns'
import { JournalClient } from './JournalClient'

export const dynamic = 'force-dynamic'
export default async function JournalPage() {
  const entries = await db.journalEntry.findMany({
    orderBy: { date: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Trip Log</div>
        <h1 className="section-title mb-1">The <em className="text-gold italic">Journal</em></h1>
        <p className="text-stone text-sm">Daily notes from the road. Add entries as you go.</p>
      </div>
      <JournalClient entries={entries} />
    </div>
  )
}
