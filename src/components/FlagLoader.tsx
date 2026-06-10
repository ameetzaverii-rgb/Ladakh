// A prayer-flag loader: five flags ripple in sequence while content streams in.
// Used for route transitions (loading.tsx) and Suspense fallbacks.

const FLAGS = ['#2f6db5', '#f6f1e7', '#d24b3e', '#3e9e6e', '#e0a21b']

export function FlagLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ''}`} role="status" aria-live="polite">
      <div className="flex items-end gap-1.5">
        {FLAGS.map((c, i) => {
          const air = c === '#f6f1e7'
          return (
            <span key={i} className="animate-flag h-7 w-5 rounded-[3px]"
              style={{ background: c, border: air ? '1px solid #d9cdaf' : 'none', animationDelay: `${i * 120}ms` }} />
          )
        })}
      </div>
      {label && <span className="label-mono text-stone">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  )
}
