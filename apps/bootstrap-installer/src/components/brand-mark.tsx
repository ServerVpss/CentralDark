import { cn } from '../lib/utils'

// Approved CentralDark ROV brand vector; this changes only the visual badge.
// Keep the original installation process and Hermes command interfaces intact.
export function BrandMark({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-label="CentralDark · OS"
      className={cn('inline-flex size-14 shrink-0 items-center justify-center', className)}
      role="img"
      {...props}
    >
      <span className="grid size-full place-items-center rounded-[11px] border border-[#7e643b] bg-[#221c14] text-[#e6bd75]">
        <svg aria-hidden="true" className="size-8" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" />
          <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
          <circle cx="16" cy="16" r="3.7" />
          <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
        </svg>
      </span>
    </span>
  )
}
