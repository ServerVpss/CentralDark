import type { ReactNode } from 'react';
import type { CentralDarkRoleId } from '~/lib/centraldark/organism';

type PetId = CentralDarkRoleId | 'sol';

export function RolePet({ id, title }: { id: PetId; title?: string }) {
  const label = title ?? (id === 'sol' ? 'SOL' : id);
  const common = (body: ReactNode) => (
    <svg className="cd-pet-svg" viewBox="0 0 64 64" role="img" aria-label={label}>
      <title>{label}</title>
      {body}
    </svg>
  );

  if (id === 'sol') return common(
    <>
      <circle className="pet-body" cx="32" cy="32" r="20" />
      <path className="pet-line" d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6" />
      <circle className="pet-eye" cx="25" cy="30" r="2.4" /><circle className="pet-eye" cx="39" cy="30" r="2.4" />
      <path className="pet-line" d="M24 39c4 4 12 4 16 0" />
    </>
  );

  if (id === 'auditor') return common(
    <>
      <path className="pet-body" d="M12 23l20-13 20 13v18L32 54 12 41z" />
      <circle className="pet-line" cx="30" cy="30" r="10" />
      <path className="pet-line" d="M37 37l9 9" />
      <circle className="pet-eye" cx="27" cy="28" r="2" /><circle className="pet-eye" cx="34" cy="28" r="2" />
    </>
  );

  if (id === 'loop') return common(
    <>
      <rect className="pet-body" x="12" y="14" width="40" height="36" rx="14" />
      <path className="pet-line" d="M18 32c0-9 7-16 16-16 6 0 11 3 14 8M46 19l2 5-6 1" />
      <path className="pet-line" d="M46 32c0 9-7 16-16 16-6 0-11-3-14-8M18 45l-2-5 6-1" />
      <circle className="pet-eye" cx="27" cy="31" r="2" /><circle className="pet-eye" cx="37" cy="31" r="2" />
    </>
  );

  if (id === 'guardrails') return common(
    <>
      <path className="pet-body" d="M32 7l20 8v15c0 13-8 22-20 27C20 52 12 43 12 30V15z" />
      <circle className="pet-eye" cx="26" cy="28" r="2" /><circle className="pet-eye" cx="38" cy="28" r="2" />
      <path className="pet-line" d="M24 37h16M32 18v5" />
    </>
  );

  if (id === 'growth') return common(
    <>
      <path className="pet-body" d="M15 47c0-12 7-21 17-21s17 9 17 21v5H15z" />
      <path className="pet-line" d="M32 27V14M32 18c-7 0-11-4-12-9 8 0 12 3 12 9zM32 21c7 0 11-4 12-9-8 0-12 3-12 9z" />
      <circle className="pet-eye" cx="27" cy="39" r="2" /><circle className="pet-eye" cx="37" cy="39" r="2" />
    </>
  );

  if (id === 'deploy') return common(
    <>
      <path className="pet-body" d="M32 7c10 9 15 18 15 28L38 45H26l-9-10c0-10 5-19 15-28z" />
      <circle className="pet-line" cx="32" cy="28" r="6" />
      <path className="pet-line" d="M24 44l-6 10M40 44l6 10M29 49h6" />
      <circle className="pet-eye" cx="30" cy="27" r="1.5" /><circle className="pet-eye" cx="34" cy="27" r="1.5" />
    </>
  );

  return common(
    <>
      <path className="pet-body" d="M14 18h36v34H14z" />
      <path className="pet-line" d="M22 18v-5h20v5M22 32h20M32 18v34" />
      <circle className="pet-eye" cx="25" cy="27" r="2" /><circle className="pet-eye" cx="39" cy="27" r="2" />
      <path className="pet-line" d="M25 39h14" />
    </>
  );
}