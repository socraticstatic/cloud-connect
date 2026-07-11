import { useCallback, useEffect, useState } from 'react';
import { Undo2, Share2, Check } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { buildShareLink } from '../share/shareLink';

/** True when the given event target is a place the user is actively typing —
 * ⌘Z/Ctrl+Z inside an input/textarea/contenteditable should do normal text
 * undo, not the engine's undo. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Undo + Share controls for the app shell top bar.
 *
 * Undo reverts the last engine mutation (`CC.undo()`), mirrors availability
 * from `CC.canUndo()`, and is also bound to the global ⌘Z / Ctrl+Z shortcut
 * (skipped while focus is in an editable field). Share copies a replay link
 * (`buildShareLink`) — built from the engine's `shareUrl()`/`serialize()` —
 * to the clipboard.
 */
export function UndoControl() {
  const canUndo = useCloudControl(cc => cc.canUndo());
  const actions = useCloudControlActions();
  const [copied, setCopied] = useState(false);

  const undo = useCallback(() => {
    actions.undo();
  }, [actions]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo]);

  const share = useCallback(async () => {
    const link = buildShareLink(actions);
    try {
      await navigator.clipboard?.writeText?.(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('clipboard write failed', e);
    }
  }, [actions]);

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        aria-label={canUndo ? `Undo ${canUndo}` : 'Nothing to undo'}
        title={canUndo ? `Undo ${canUndo}` : 'Nothing to undo'}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Undo2 className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        onClick={share}
        aria-label="Share a replay link"
        title={copied ? 'Copied!' : 'Copy a replay link to the clipboard'}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash transition-colors"
      >
        {copied ? <Check className="h-[18px] w-[18px] text-[#2d7e24]" /> : <Share2 className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}
