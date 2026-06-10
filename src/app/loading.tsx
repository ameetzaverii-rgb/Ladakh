import { FlagLoader } from '@/components/FlagLoader'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <FlagLoader label="One moment…" />
    </div>
  )
}
