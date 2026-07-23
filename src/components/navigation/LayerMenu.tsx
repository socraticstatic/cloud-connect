import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AttIcon } from '../icons/AttIcon';
import { isNavRouteActive, type NavLayer } from './navItems';

/**
 * One layer of the stack, as a dropdown in the desktop bar.
 *
 * The trigger is the layer's name — the only place its verbs appear is inside
 * the open panel, so "Connect" can never sit beside another "Connect" in the
 * bar. The trigger carries the active underline whenever the viewer is
 * anywhere inside the layer; aria-current stays on the verb link itself.
 *
 * Hover opens with a small close delay so the pointer can travel into the
 * panel; click and keyboard (Enter / Space / ArrowDown) open it for everyone
 * else. Esc closes and returns focus to the trigger. Route change closes.
 */
export function LayerMenu({ layer }: { layer: NavLayer }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const panelId = useId();

  const layerActive = layer.items.some(i => isNavRouteActive(location.pathname, i.to));

  // A navigation is the menu doing its job — close behind it.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const focusItem = (index: number) => {
    const items = panelRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
    if (!items?.length) return;
    const clamped = ((index % items.length) + items.length) % items.length;
    items[clamped].focus();
  };

  // The panel mounts on the state flip; focus must wait for it to exist,
  // so the pending index rides state and an effect spends it post-render.
  const [pendingFocus, setPendingFocus] = useState<number | null>(null);
  useEffect(() => {
    if (open && pendingFocus !== null) {
      focusItem(pendingFocus);
      setPendingFocus(null);
    }
  }, [open, pendingFocus]);

  const openAndFocus = (index: number) => {
    setOpen(true);
    setPendingFocus(index);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAndFocus(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAndFocus(-1);
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const items = panelRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
    if (!items?.length) return;
    const current = Array.from(items).indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(current + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
    else if (e.key === 'End') { e.preventDefault(); focusItem(items.length - 1); }
    else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative h-full flex items-stretch"
      onPointerEnter={e => { if (e.pointerType === 'mouse') { cancelClose(); setOpen(true); } }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') scheduleClose(); }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`
          inline-flex items-center gap-1 px-1 py-4 h-full border-b-2 font-medium
          text-figma-base tracking-[-0.03em] whitespace-nowrap transition-all duration-200
          ${layerActive
            ? 'border-fw-active text-fw-link'
            : 'border-transparent text-fw-heading hover:border-fw-secondary hover:text-fw-body'}
        `}
      >
        {layer.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={layer.label}
          onKeyDown={onPanelKeyDown}
          className="absolute left-0 top-full w-80 rounded-lg border border-fw-secondary bg-fw-base shadow-lg p-2"
          style={{ zIndex: 60 }}
        >
          <p className="px-3 pt-2 pb-3 text-figma-sm text-fw-bodyLight border-b border-fw-secondary/60">
            {layer.blurb}
          </p>
          <ul className="pt-1.5">
            {layer.items.map(item => {
              const active = isNavRouteActive(location.pathname, item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    role="menuitem"
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors
                      ${active ? 'bg-fw-accent' : 'hover:bg-fw-wash focus-visible:bg-fw-wash'}
                    `}
                  >
                    <AttIcon
                      name={item.icon}
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${active ? 'text-fw-link' : 'text-fw-bodyLight'}`}
                    />
                    <span className="min-w-0">
                      <span className={`block text-figma-base font-medium tracking-[-0.02em] ${active ? 'text-fw-link' : 'text-fw-heading'}`}>
                        {item.label}
                      </span>
                      <span className="block text-figma-sm text-fw-bodyLight">{item.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
