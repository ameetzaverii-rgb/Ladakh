// Reusable "reviews from across the web" links. No paid review API is required —
// each button deep-links to where the live ratings/reviews actually live.

export function ReviewLinks({
  name,
  context = 'Leh Ladakh',
  className = '',
}: {
  name: string
  /** Extra words to disambiguate the search, e.g. a neighbourhood or "trek". */
  context?: string
  className?: string
}) {
  const q = encodeURIComponent(`${name} ${context}`.trim())
  const links = [
    { label: 'Google Maps', icon: '★', href: `https://www.google.com/maps/search/?api=1&query=${q}` },
    { label: 'TripAdvisor', icon: '🦉', href: `https://www.tripadvisor.com/Search?q=${q}` },
    { label: 'Web', icon: '🔍', href: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${context} reviews`)}` },
  ]
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="label-mono text-[0.5rem] text-stone mr-0.5">Reviews:</span>
      {links.map(l => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pill border border-gold/20 text-stone hover:text-gold hover:border-gold/50 transition-colors"
        >
          <span className="mr-1">{l.icon}</span>{l.label}
        </a>
      ))}
    </div>
  )
}
