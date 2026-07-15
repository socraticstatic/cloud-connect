import { PATHS, MONO, COLOR, NAME } from './providerMarks';

/**
 * Official provider brand mark on a rounded tile with a faint brand wash.
 * AWS/Azure/GCP/OCI render the simple-icons path in brand color; CoreWeave
 * and Nebius render their monogram (no official mark in the set). The tile
 * uses `{color}1c` bg + `{color}55` border so marks read on light surfaces.
 *
 *   <ProviderLogo id="aws" size={28} />
 */
export function ProviderLogo({ id, size = 22 }: { id: string; size?: number }) {
  const color = COLOR[id] || '#9aa6bd';
  const label = NAME[id] || id.toUpperCase();
  const path = PATHS[id];

  return (
    <span
      role="img"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: Math.max(4, Math.round(size * 0.28)),
        background: `${color}1c`,
        border: `1px solid ${color}55`,
      }}
    >
      {path ? (
        <svg
          viewBox="0 0 24 24"
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          fill={color}
          aria-hidden="true"
        >
          <path d={path} />
        </svg>
      ) : (
        <span
          aria-hidden="true"
          style={{
            fontSize: Math.round(size * 0.42),
            fontWeight: 700,
            color,
            letterSpacing: '0.3px',
          }}
        >
          {MONO[id] || id.toUpperCase().slice(0, 2)}
        </span>
      )}
    </span>
  );
}
