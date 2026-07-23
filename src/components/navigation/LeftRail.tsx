import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AttIcon } from '../icons/AttIcon';
import { isNavRouteActive, layerForPath, layerRail } from './navItems';

/**
 * The lifecycle rail: the verbs of the layer you are in, down the left edge,
 * Home first. It is the busy axis — a session crosses Home → Connect → Govern
 * → Observe → Cost far more than it crosses layers — so it gets the cheap
 * control: persistent, one click, no menu.
 *
 * Collapsible to icons only (persisted): the rail shrinks to a 56px strip of
 * glyphs with tooltips, handing its width back to the content. Renders only on
 * a layer route (/naas/*, /ai/*); the global estate view (/discover) carries
 * no rail. Desktop only — the mobile drawer carries the same items.
 */

const COLLAPSE_KEY = 'cc-rail-collapsed';

export function LeftRail() {
  const { pathname } = useLocation();
  const layer = layerForPath(pathname);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* private mode */ }
  }, [collapsed]);

  if (!layer) return null;

  return (
    <nav
      aria-label={`${layer.label} sections`}
      data-testid="left-rail"
      data-collapsed={collapsed ? 'true' : 'false'}
      className={`hidden min-[1024px]:flex flex-col flex-shrink-0 border-r border-fw-secondary bg-fw-base min-h-full py-4 px-3 transition-[width] duration-200 ${collapsed ? 'w-14 items-center' : 'w-56'}`}
    >
      {/* Rail header: the layer name (hidden when collapsed) and the toggle. */}
      <div className={`flex items-center h-7 mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="pl-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-fw-bodyLight truncate">
            {layer.label}
          </span>
        )}
        <button
          type="button"
          data-testid="rail-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-fw-bodyLight hover:bg-fw-wash hover:text-fw-body transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <ul className="w-full space-y-0.5">
        {layerRail(layer).map(item => {
          const active = isNavRouteActive(pathname, item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                data-testid={`rail-${item.to.split('/').pop()}`}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center rounded-lg text-figma-sm font-medium transition-colors
                  ${collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 py-2.5'}
                  ${active
                    ? 'bg-fw-accent text-fw-link'
                    : 'text-fw-body hover:bg-fw-wash hover:text-fw-heading'}
                `}
              >
                <AttIcon
                  name={item.icon}
                  className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-fw-link' : 'text-fw-bodyLight'}`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
