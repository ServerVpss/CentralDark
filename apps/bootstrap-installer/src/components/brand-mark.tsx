import { cn } from '../lib/utils'

// Approved CentralDark ROV brand vector; this changes only the visual badge.
// Keep the original installation process and Hermes command interfaces intact.
export function BrandMark({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-label="CentralDark · OS"
      className={cn('inline-flex shrink-0 items-center justify-center', className || 'size-14')}
      role="img"
      {...props}
    >
      <span className="centraldark-rov-mark grid place-items-center">
        <svg aria-hidden="true" className="centraldark-rov-eye" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <circle cx="16" cy="16" r="12" />
          <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
          <circle cx="16" cy="16" r="3.7" />
          <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
        </svg>
      </span>
    </span>
  )
}
