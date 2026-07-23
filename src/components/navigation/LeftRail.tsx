import { Link, useLocation } from 'react-router-dom';
import { AttIcon } from '../icons/AttIcon';
import { isNavRouteActive, layerForPath, layerRail } from './navItems';

/**
 * The lifecycle rail: the verbs of the layer you are in, down the left edge,
 * with Home first. It is the busy axis — a session crosses Home → Connect →
 * Govern → Observe → Cost far more than it crosses layers — so it gets the
 * cheap control: persistent, one click, no menu. Layers switch up top; the
 * lifecycle switches here.
 *
 * Renders only on a layer route (/naas/*, /ai/*); the global estate view
 * (/discover) carries no rail. Desktop only — the mobile drawer carries the
 * same items below 1024px.
 */
export function LeftRail() {
  const { pathname } = useLocation();
  const layer = layerForPath(pathname);
  if (!layer) return null;

  return (
    <nav
      aria-label={`${layer.label} sections`}
      data-testid="left-rail"
      className="hidden min-[1024px]:flex flex-col w-56 flex-shrink-0 border-r border-fw-secondary bg-fw-base min-h-full py-5 px-3"
    >
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-fw-bodyLight">
        {layer.label}
      </p>
      <ul className="space-y-0.5">
        {layerRail(layer).map(item => {
          const active = isNavRouteActive(pathname, item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                data-testid={`rail-${item.to.split('/').pop()}`}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-figma-sm font-medium
                  transition-colors
                  ${active
                    ? 'bg-fw-accent text-fw-link'
                    : 'text-fw-body hover:bg-fw-wash hover:text-fw-heading'}
                `}
              >
                <AttIcon
                  name={item.icon}
                  className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-fw-link' : 'text-fw-bodyLight'}`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
