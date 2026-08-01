# AT&T Email Gate Rollout Implementation Plan (Rev 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put a real, server-enforced @att.com email gate (Supabase OTP) in front of the four public GH Pages prototypes: cloud-connect, att-netbond-sdci, Cloud_Designer, cloud-control - without endangering Ramesh's analyst demo Monday 2026-08-03.

**Architecture:** A **new, dedicated Supabase project** ("att-gate") used by all four apps. Server-side "Before User Created" auth hook enforces @att.com so the restriction cannot be bypassed with curl. Login UX is **6-digit OTP code entry** with a **code-only email template** (no link - see Finding #10). Each React app gets a root-level Gate wrapper; cloud-control gets a vanilla-JS overlay with a locally vendored supabase-js. A `VITE_AUTH_MODE` kill switch reverts any app to a localStorage-only gate in one deploy.

**Tech Stack:** Supabase Auth (`signInWithOtp` + `verifyOtp`), `@supabase/supabase-js@2`, React (three apps), vanilla JS + vendored supabase-js (cloud-control), GitHub Pages.

## Rev 2 - What the adversarial re-assessment changed

1. **Rev 1's Proofpoint defense was broken.** The emailed 6-digit code and the magic link are two representations of the **same single-use token**. If the email contains the link, Proofpoint's scanner can pre-fetch it and consume the token - killing the code too. The template must be **code-only**. That conflicts with product-value-engine's link-based login, so:
2. **D1 flipped: new dedicated Supabase project, not PVE reuse.** Rev 1 froze cloud-connect deploys before the demo while cheerfully mutating the live PVE project's auth hook, email template, and SMTP 48 hours before that same demo. That was a contradiction. A fresh project gives a code-only template, independent rate limits, and zero blast radius into the one auth stack that already works.
3. **None of the four sites is gated today.** cloud-connect: `ProtectedRoute.tsx` exists but is used **zero times** in `App.tsx`. att-netbond-sdci: `MagicLinkLogin` is a decorative `/login` route no guard ever forces you through. All four deployments are fully open right now. This plan doesn't "swap fake auth for real" - it wires auth in for the first time, which raises regression risk and is why root-level Gate wrappers (small, uniform) are used instead of threading guards through big route trees.
4. **The existing e2e suites will break.** cloud-connect's `tests/e2e/helpers.ts` authenticates by writing `att_nb_user` to localStorage. In supabase mode that does nothing. CI runs legacy suites against a `VITE_AUTH_MODE=gate` build; the new auth spec runs against a supabase-mode build with network stubs.
5. **Desktop/offline builds must keep working.** `ProtectedRoute` bypasses auth for `file://` and Electron (cloud-connect ships desktop builds; netbond has `build-desktop.yml`). The Gate keeps that bypass. Honest note: the Electron check is `userAgent.includes('Electron')` - trivially spoofable. Acceptable under this threat model (Finding #3); the `file:` protocol check is not spoofable from a browser.
6. **cloud-control's gate must not depend on esm.sh.** CDN hiccup + a pre-locked body = blank site. supabase-js gets vendored into the repo's existing `vendor/` dir.
7. **New critical-path dependency #0:** an @att.com inbox readable this weekend, and the venue machine/network able to reach `*.supabase.co`. Both verified before Sunday freeze, plus a Monday 07:00 smoke test.

## The Adversarial Findings

**1. The thing you remember is two different things.** The beautiful screen (`MagicLinkLogin.tsx` in att-netbond-sdci, copied into cloud-connect) **never sends a magic link** - `signIn(email)` writes `{email}` to localStorage. The **real** magic-link stack is **product-value-engine** (`src/pages/Login.tsx`): Supabase `signInWithOtp`, @att.com zod refine, and edge functions that re-verify the domain server-side.

**2. Even the "real" one has a hole.** PVE's domain check at sign-in is client-side. Anyone with the public anon key can call `signInWithOtp({email:'anyone@gmail.com'})` and get a session; PVE survives only because its edge functions re-check. These four apps have no edge functions - a session alone unlocks everything. Server-side enforcement at user creation is mandatory (Task 2).

**3. Be honest about what this buys.** All four apps are static GH Pages sites; the entire bundle, mock data included, stays world-downloadable regardless of auth. The gate provides a locked front door, deterrence, an audit trail, and real "only AT&T people can *use* it" enforcement. It does **not** make content confidential. True confidentiality = server-gated hosting (Decision D3).

**4. Magic *links* are the wrong primary UX for @att.com recipients.** Proofpoint URL Defense rewrites and pre-fetches links; PKCE links fail cross-device. Codes have neither failure mode.

**5. Supabase's built-in mailer is a demo-killer.** A couple of best-effort emails per hour. Custom SMTP is configured and proven in Task 1 before any code ships.

**6. Shared origin = free SSO, deliberately.** All four apps on `https://socraticstatic.github.io/` + one Supabase project + default storage key (`sb-<ref>-auth-token`) = sign in once, unlocked everywhere. Do NOT override `storageKey`. (Corollary: any XSS in *any* socraticstatic.github.io page could read the token. Accepted under this threat model; other users' `*.github.io` sites cannot - github.io is on the Public Suffix List.)

**7. Demo-risk sequencing.** cloud-connect ships first (Saturday), full verification Sunday, deploy freeze Sunday 18:00 CDT, kill switch drill-timed, Ramesh dry-run on the actual presenting machine. The other three deploy only after cloud-connect verifies.

**8. Things only Micah can do** - marked **[HUMAN]**: Supabase dashboard work (project creation, SMTP, template, hook toggle, rate limits) and reading an @att.com inbox.

**9. Nothing is wired today** (see Rev 2 #3). Consequence for Plan B: "stop the rollout" leaves the sites **open**, not gated. Monday's demo is safe either way because nothing changed; the exposure concern stays unfixed until the rollout lands.

**10. The single-use token trap.** `{{ .Token }}` (code) and `{{ .ConfirmationURL }}` (link) are the same token. A link-scanning gateway consumes both. Code-only template, always, for this project.

## Decision Points (defaults chosen; overridable)

| # | Decision | Default | Why |
|---|---|---|---|
| D1 | Supabase project | **New dedicated project `att-gate`** | Code-only template without breaking PVE; no mutation of a live app's auth before a demo; independent rate limits. Fallback: reuse PVE project *only* if new-project creation is blocked, accepting that its template must then carry both code and link - and with it the Proofpoint token-burn risk (Finding #10). |
| D2 | Analyst access after Monday | **Locked out** (@att.com only) | The point is closing public access. Follow-up access for a named analyst = add their email to the hook's allowlist array - 5-minute SQL change. |
| D3 | Real confidentiality (server-gated hosting) | **Deferred** | Not achievable on GH Pages; not needed by Monday. Today the honest answer to "can outsiders see it?" is "the bundle is public." |

## Global Constraints

- Demo freeze: **no deploys to cloud-connect after Sunday 2026-08-02 18:00 CDT.** Monday 07:00 smoke test before Ramesh presents.
- Email template is **code-only** (`{{ .Token }}`); never add `{{ .ConfirmationURL }}` to the att-gate project.
- Do not override supabase-js `storageKey` (shared-origin SSO depends on the default).
- The att-gate project URL + publishable key are produced by Task 1 and are public-by-design; hardcode them in a committed `src/lib/supabase.ts` per app. Never commit the service-role key or SMTP credentials anywhere.
- Preserve each app's existing login-card styling; only swap plumbing and add the code-entry step.
- Every app keeps `VITE_AUTH_MODE` (`supabase` | `gate`): `gate` = localStorage-only behavior, instant rollback, and the mode legacy e2e suites run against.
- Desktop/offline (`file:` protocol or Electron) bypasses the gate - desktop builds have no business emailing OTPs.
- Per ~/CLAUDE.md: no UI task is done without walking the flow in a browser as a user.

---

### Task 0: **[HUMAN]** Critical-path preconditions (15 minutes, do first)

- [ ] **Step 1:** Confirm you can read your @att.com inbox from home this weekend (phone or webmail). If not, the rollout cannot be verified before Monday - stop and reschedule; the demo is safe on the status quo.
- [ ] **Step 2:** Ask Ramesh (or check yourself if you have access) whether the presenting machine/network can reach `https://yttpppvuzurerzhsrzmi.supabase.co/auth/v1/health` (any Supabase URL works for this reachability probe). Corporate SSL inspection or venue WiFi blocking `*.supabase.co` would force gate-mode for the demo - better to know Saturday.
- [ ] **Step 3:** Confirm with Ramesh: he presents signed-in (recommended), and can receive @att.com mail on his phone as the podium fallback.

### Task 1: **[HUMAN]** Stand up the att-gate project + prove email delivery

**Files:** none (Supabase dashboard + inbox)

**Interfaces:**
- Produces: `ATT_GATE_URL` (project URL) and `ATT_GATE_PUBLISHABLE_KEY` (anon/publishable key) - consumed verbatim by Tasks 3, 5, 6, 7. Record them at the bottom of this file when created.

- [ ] **Step 1:** Supabase dashboard → New project → name `att-gate`, region us-east. Record `ATT_GATE_URL` + `ATT_GATE_PUBLISHABLE_KEY` at the bottom of this plan.
- [ ] **Step 2:** Authentication → Providers: Email only; disable all OAuth providers. Leave "Confirm email" defaults (OTP flow ignores it).
- [ ] **Step 3:** Authentication → Emails → SMTP: configure custom SMTP. First choice: the PVE project's SMTP settings if it has them (copy host/port/user; re-enter the password from wherever it lives - check Keychain and `~/.hermes/.env` before assuming it's lost). Second: the pen-and-paper stack's SMTP provider (delivering magic links since 2026-06-23). Third: create a Resend account/key. Consumer Gmail SMTP is the last resort - corporate filters distrust it.
- [ ] **Step 4:** Authentication → Email Templates → Magic Link: replace the entire body with a code-only template, e.g. subject `Your AT&T prototype sign-in code`, body: `Your one-time code is: {{ .Token }} - it expires in 1 hour. If you didn't request this, ignore this email.` **No `{{ .ConfirmationURL }}` anywhere** (Finding #10).
- [ ] **Step 5:** Authentication → Rate Limits: raise "emails per hour" from the default 30 to 100 (Sunday testing + Monday headroom).
- [ ] **Step 6:** Prove delivery: from any terminal:

```bash
curl -s -X POST "$ATT_GATE_URL/auth/v1/otp" \
  -H "apikey: $ATT_GATE_PUBLISHABLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"<your-attuid>@att.com","create_user":true}'
```

Confirm the email lands in the @att.com inbox (check junk) within 2 minutes and contains only a 6-digit code. Repeat until reliable.

**Gate: if Step 6 fails after SMTP attempts, STOP the rollout. Ship nothing. The sites stay as they are (open - Finding #9) and Monday is safe.**

### Task 2: Server-side @att.com enforcement (auth hook)

**Files:**
- Create: `~/Developer/cloud-connect/docs/superpowers/plans/att-gate-hook.sql` (kept beside this plan; the att-gate project has no repo)

**Interfaces:**
- Produces: Postgres function `public.hook_restrict_signup_domain(event jsonb) returns jsonb`, enabled as the att-gate project's **Before User Created** hook. All later tasks rely on non-@att.com `signInWithOtp` calls failing server-side.

- [ ] **Step 1: Write the SQL file**

```sql
-- att-gate: rejects user creation for any email not ending in @att.com.
-- Wired as the "Before User Created" auth hook (Dashboard → Auth → Hooks).
-- D2 escape hatch: add specific external emails to the allowlist array.
create or replace function public.hook_restrict_signup_domain(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  em text := lower(coalesce(event->'user'->>'email', ''));
  allowlist text[] := array[]::text[];  -- e.g. array['analyst@firm.com']
begin
  if em like '%@att.com' or em = any(allowlist) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Only @att.com email addresses are authorized'
    )
  );
end;
$$;

grant execute on function public.hook_restrict_signup_domain to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_domain from authenticated, anon, public;
```

- [ ] **Step 2: [HUMAN]** Paste into the att-gate SQL editor and run. Then Dashboard → Authentication → Hooks → Before User Created → enable → Postgres function → `public.hook_restrict_signup_domain`.
- [ ] **Step 3 (fallback only):** If the Before User Created hook isn't offered on this project tier, use a trigger instead - append to the SQL file and run:

```sql
create or replace function public.enforce_att_domain()
returns trigger language plpgsql security definer as $$
begin
  if lower(new.email) not like '%@att.com' then
    raise exception 'Only @att.com email addresses are authorized';
  end if;
  return new;
end; $$;

create trigger enforce_att_domain_trg
  before insert on auth.users
  for each row execute function public.enforce_att_domain();
```

- [ ] **Step 4: Verify the curl bypass is closed** (Finding #2):

```bash
curl -s -X POST "$ATT_GATE_URL/auth/v1/otp" \
  -H "apikey: $ATT_GATE_PUBLISHABLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"attacker@gmail.com","create_user":true}'
```
Expected: HTTP 4xx with `Only @att.com email addresses are authorized` (hook) or a generic database error (trigger fallback). Either way: **no email sent, no user created** - confirm under Authentication → Users.

- [ ] **Step 5:** Same curl with an @att.com address → 200, email arrives, user appears.
- [ ] **Step 6: Commit** the SQL file in cloud-connect: `git commit -m "feat(auth): att-gate before-user-created hook SQL (server-side @att.com enforcement)"`.

### Task 3: cloud-connect - wire real auth in (it is NOT wired today)

**Files:**
- Create: `~/Developer/cloud-connect/src/lib/supabase.ts`
- Modify: `~/Developer/cloud-connect/src/contexts/AuthContext.tsx` (full rewrite, same file)
- Modify: `~/Developer/cloud-connect/src/components/pages/MagicLinkLogin.tsx` (add code-entry step)
- Modify: `~/Developer/cloud-connect/src/main.tsx` (add root Gate - `ProtectedRoute.tsx` exists but is referenced nowhere; the app is open)
- Modify: `~/Developer/cloud-connect/playwright.config.ts` (or CI workflow) - legacy suites run against a gate-mode build
- Test: `~/Developer/cloud-connect/tests/e2e/auth-gate.spec.ts`

**Interfaces:**
- Consumes: `ATT_GATE_URL`, `ATT_GATE_PUBLISHABLE_KEY` from Task 1; hook behavior from Task 2.
- Produces: `useAuth()` returning `{ user: {email} | null, loading: boolean, authMode: 'supabase'|'gate', requestCode(email): Promise<{error?: string}>, verifyCode(email, code): Promise<{error?: string}>, signIn(email): void, signOut(): Promise<void> }`. `signIn` remains for `gate` mode so the kill switch needs no UI changes. Tasks 5 and 6 copy these files verbatim.

- [ ] **Step 1:** `cd ~/Developer/cloud-connect && npm i @supabase/supabase-js@2`
- [ ] **Step 2: Create `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

// Public-by-design values (they ship in every bundle). Do NOT set a custom
// storageKey: the default sb-<ref>-auth-token is shared across all
// socraticstatic.github.io apps = single sign-on across the prototypes.
const SUPABASE_URL = '<ATT_GATE_URL from Task 1>';
const SUPABASE_PUBLISHABLE_KEY = '<ATT_GATE_PUBLISHABLE_KEY from Task 1>';

export const AUTH_MODE: 'supabase' | 'gate' =
  (import.meta.env.VITE_AUTH_MODE as 'supabase' | 'gate') ?? 'supabase';

// Flash-drive/offline builds load over file: and cannot do email OTP.
// file: only — NEVER a userAgent check. Found live 2026-08-01: ordinary
// Electron-shell browsers (Slack/Discord webviews, the Claude browser pane)
// carry "Electron" in their UA and sailed straight past a UA-based bypass.
export const IS_OFFLINE_CAPABLE = window.location.protocol === 'file:';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
```

- [ ] **Step 3: Rewrite `src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, AUTH_MODE, IS_OFFLINE_CAPABLE } from '../lib/supabase';

const GATE_KEY = 'att_nb_user';

interface AuthUser { email: string }
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authMode: 'supabase' | 'gate';
  requestCode: (email: string) => Promise<{ error?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ error?: string }>;
  signIn: (email: string) => void;      // gate-mode only
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (IS_OFFLINE_CAPABLE) return { email: 'offline@att.com' };
    if (AUTH_MODE !== 'gate') return null;
    try { const raw = localStorage.getItem(GATE_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(AUTH_MODE === 'supabase' && !IS_OFFLINE_CAPABLE);

  useEffect(() => {
    if (AUTH_MODE !== 'supabase' || IS_OFFLINE_CAPABLE) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?.email ? { email: session.user.email } : null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user?.email ? { email: session.user.email } : null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const requestCode = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email: email.toLowerCase().trim() });
    if (error) {
      if (error.status === 403) return { error: 'Only @att.com email addresses are authorized' };
      if (error.status === 429) return { error: 'Too many requests. Wait a minute and try again.' };
      return { error: error.message || 'Failed to send code' };
    }
    return {};
  };

  const verifyCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(), token: code.trim(), type: 'email',
    });
    if (error) return { error: 'Invalid or expired code. Request a new one.' };
    return {};
  };

  const signIn = (email: string) => {
    if (AUTH_MODE !== 'gate') return;
    const u = { email: email.toLowerCase().trim() };
    localStorage.setItem(GATE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = async () => {
    if (AUTH_MODE === 'supabase') await supabase.auth.signOut();
    localStorage.removeItem(GATE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authMode: AUTH_MODE, requestCode, verifyCode, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
```

- [ ] **Step 4: Wire the root Gate in `src/main.tsx`** - today `<AuthProvider><App/></AuthProvider>` renders App unconditionally. Replace the inner render with:

```tsx
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
const MagicLinkLogin = lazy(() => import('./components/pages/MagicLinkLogin'));

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 border-2 border-[#0057b8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Suspense fallback={null}><MagicLinkLogin /></Suspense>;
  return <App />;
}
// render tree becomes: <HashRouter><AuthProvider><Gate /></AuthProvider></HashRouter>
```

Root-gating (not per-route `ProtectedRoute`) is deliberate: one uniform wrapper across all four apps, no route-tree surgery in a large `App.tsx` 48 hours before a demo. Remove the `<Navigate to="/" replace>` line from `MagicLinkLogin.tsx` (the Gate now decides; the component no longer needs react-router). Leave `ProtectedRoute.tsx` untouched - it's dead code today and stays dead.

- [ ] **Step 5: Add the code-entry step to `MagicLinkLogin.tsx`** - keep every existing style, animation, checkbox, and the shake. Changes only:
  - Add state: `const [step, setStep] = useState<'email' | 'code'>('email'); const [code, setCode] = useState(''); const [busy, setBusy] = useState(false); const [cooldown, setCooldown] = useState(0);`
  - `handleSubmit` becomes async: after the same `validate(email)` passes - `setBusy(true); const r = authMode === 'gate' ? (signIn(email), {}) : await requestCode(email); setBusy(false); if (r.error) { setError(r.error); setShakeError(true); setTimeout(() => setShakeError(false), 600); } else if (authMode !== 'gate') { setStep('code'); startCooldown(); }` where `startCooldown` sets 60 and decrements via interval.
  - New code form (rendered when `step === 'code'`, same card): heading "Check your email", subline `We sent a 6-digit code to {email}`, helper line `No email after a minute? Check your junk folder.`, an `<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000">` styled identically to the email input, a "Verify" submit calling `verifyCode(email, code)` (error → same shake/error treatment), and two text links: "Use a different email" (`setStep('email')`) and "Resend code" (calls `requestCode(email)`, disabled while `cooldown > 0`, label shows the countdown - Supabase enforces a 60s resend window and 429s otherwise).
- [ ] **Step 6: Keep the legacy e2e suite green.** The existing helpers authenticate by writing `att_nb_user` - dead in supabase mode. In the CI workflow / package.json, make the e2e build use gate mode: `VITE_AUTH_MODE=gate` for the build step that legacy specs run against (helpers then keep working unchanged). Add a separate script `test:e2e:auth` that builds default (supabase) mode and runs only `auth-gate.spec.ts`.
- [ ] **Step 7: Write the failing auth-gate spec** `tests/e2e/auth-gate.spec.ts` (network-stubbed; never emails anyone):

```ts
import { test, expect } from '@playwright/test';

test.describe('att.com auth gate', () => {
  test('app is locked: content not reachable signed-out', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
  });

  test('rejects non-att.com email client-side', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('outsider@gmail.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page.getByText('Only @att.com email addresses are allowed')).toBeVisible();
  });

  test('att.com email advances to code entry', async ({ page }) => {
    await page.route('**/auth/v1/otp**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.goto('/');
    await page.getByLabel(/email/i).fill('mb1234@att.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page.getByText(/6-digit code/i)).toBeVisible();
  });

  test('bad code shows error, app stays locked', async ({ page }) => {
    await page.route('**/auth/v1/otp**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.route('**/auth/v1/verify**', (route) =>
      route.fulfill({ status: 403, contentType: 'application/json',
        body: '{"error_code":"otp_expired","msg":"Token has expired or is invalid"}' }));
    await page.goto('/');
    await page.getByLabel(/email/i).fill('mb1234@att.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByText(/invalid or expired code/i)).toBeVisible();
  });

  test('localStorage forgery does not unlock supabase mode', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('att_nb_user', JSON.stringify({ email: 'x@att.com' })));
    await page.goto('/');
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
  });
});
```

- [ ] **Step 8:** `npm run test:e2e:auth` → all five fail (Gate/code step don't exist) → finish Steps 2-5 → rerun → all five pass. Then run the legacy suite against the gate-mode build → green.
- [ ] **Step 9: Manual browser walk (dev server):** non-att rejected → att email → code screen → **[HUMAN]** enter the real code from the @att.com inbox → app unlocks → refresh → still signed in → sign out → locked again.
- [ ] **Step 10: Commit** `git commit -m "feat(auth): wire root att.com OTP gate (app was previously unguarded), gate-mode kill switch, e2e"`.

### Task 4: cloud-connect - deploy + live verification + demo hardening

**Files:** none new (deploy + verification)

- [ ] **Step 1:** Deploy Saturday: `npm run deploy`. Confirm publish.
- [ ] **Step 2:** Live walk on `https://socraticstatic.github.io/cloud-connect/` in fresh incognito: locked → non-att rejected → att.com → **[HUMAN]** real code → unlocked → hard refresh → still unlocked → deep-link a hash sub-route while signed out → login card → after sign-in the app loads (no white screen).
- [ ] **Step 3:** Bypass checks against production: the Task 2 Step 4 curl (403, no email), and DevTools `localStorage.setItem('att_nb_user', ...)` + refresh must NOT unlock.
- [ ] **Step 4: Kill-switch drill:** `VITE_AUTH_MODE=gate npm run deploy`, confirm old checkbox-gate behavior live, redeploy normal mode, time the round trip (~3 min). Write the exact command into the repo README under "Demo emergency rollback" so it's runnable by phone instructions if you're not at a keyboard Monday.
- [ ] **Step 5: [HUMAN] Sunday, before 18:00 CDT:** Ramesh dry-run **on the machine and network he presents from** (Task 0 Step 2 reachability): sign in with his @att.com email, stay signed in, bookmark the URL. Refresh token keeps him signed in Monday; podium fallback = one code from his phone.
- [ ] **Step 6:** Deploy freeze. **[HUMAN] Monday 07:00:** open the bookmarked URL on the presenting machine - still signed in, app loads. If anything is wrong: run the README rollback (gate mode) - demo proceeds on the visual gate.

### Task 5: att-netbond-sdci - wire the gate (today /login is decorative)

**Files:**
- Create: `~/Developer/att-netbond-sdci/src/lib/supabase.ts` (identical to Task 3 Step 2)
- Modify: `~/Developer/att-netbond-sdci/src/contexts/AuthContext.tsx` (identical rewrite - the file is byte-for-byte the same fake today)
- Modify: `~/Developer/att-netbond-sdci/src/components/pages/MagicLinkLogin.tsx` (same code-entry step as Task 3 Step 5; this is the original file the cloud-connect copy came from)
- Modify: netbond's root render (its `main.tsx`/`App.tsx` equivalent of Task 3 Step 4) - **no guard exists anywhere in this app**; add the same root Gate, and delete the now-redundant `/login` route.

- [ ] **Step 1:** `npm i @supabase/supabase-js@2`; apply the four changes exactly as written in Task 3 (Steps 2-5). Keep the desktop bypass - this repo ships Electron builds (`build-desktop.yml`), which must never see the gate.
- [ ] **Step 2:** Dev walk: locked at `/` (not just `/login`) → reject non-att → att → code → **[HUMAN]** real code → unlocked → refresh persists.
- [ ] **Step 3:** SSO check after deploy: with a live cloud-connect session in the same browser, this app's URL skips login entirely. If not, a storageKey override crept in - fix it.
- [ ] **Step 4:** Commit, `npm run deploy`, live walk + curl + localStorage-forgery checks as in Task 4 Steps 2-3.

### Task 6: Cloud_Designer - add the gate (no router in this app)

**Files:**
- Create: `~/Developer/Cloud_Designer/src/lib/supabase.ts` (identical to Task 3 Step 2)
- Create: `~/Developer/Cloud_Designer/src/contexts/AuthContext.tsx` (identical to Task 3 Step 3)
- Create: `~/Developer/Cloud_Designer/src/components/auth/MagicLinkLogin.tsx` - copy from att-netbond-sdci after Task 5, then: remove any `react-router-dom` import and `<Navigate>` usage (already removed in Task 3 Step 4's version), retitle the card `AT&T Cloud Designer`, point at this repo's AT&T globe asset.
- Modify: `~/Developer/Cloud_Designer/src/main.tsx` - same root Gate as Task 3 Step 4 (`<AuthProvider><Gate/></AuthProvider>`, no router wrapper).

- [ ] **Step 1:** `npm i @supabase/supabase-js@2`; create the files.
- [ ] **Step 2:** Dev walk + **[HUMAN]** real-code unlock; verify the designer canvas loads post-login and watch the console - this repo manual-chunks aggressively and already defines a `supabase` chunk group, so confirm no chunk-order errors.
- [ ] **Step 3:** Commit, deploy via the repo's `deploy.yml`, live walk + SSO check + bypass checks.

### Task 7: cloud-control - vanilla JS gate, no CDN dependency

**Files:**
- Create: `~/Developer/cloud-control/vendor/supabase-js/` (vendored library)
- Create: `~/Developer/cloud-control/js/auth-gate.js`
- Modify: `~/Developer/cloud-control/index.html` (inline lock class + one script tag)
- Test: `~/Developer/cloud-control/tests/auth-gate.spec.js`

**Interfaces:** none consumed by later tasks. Honest note: a no-build static page cannot hide its own JS; this gate blocks *rendering* for non-AT&T visitors and joins the SSO. That is the agreed threat model (Finding #3).

- [ ] **Step 1: Vendor supabase-js** (the gate must not depend on esm.sh being up - Rev 2 #6):

```bash
cd ~/Developer/cloud-control
curl -sL https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm -o vendor/supabase-js/supabase.esm.js
```

If the bundle imports further CDN sub-modules (open it and check for `from"https://` / `from"/npm/`), instead run `npm pack @supabase/supabase-js` and vendor the package's UMD build (`dist/umd/supabase.js`), loading it via a plain script tag and `window.supabase.createClient`.

- [ ] **Step 2: Create `js/auth-gate.js`** (ES module):

```js
import { createClient } from '../vendor/supabase-js/supabase.esm.js';

const SUPABASE_URL = '<ATT_GATE_URL from Task 1>';
const SUPABASE_PUBLISHABLE_KEY = '<ATT_GATE_PUBLISHABLE_KEY from Task 1>';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});

const overlay = document.createElement('div');
overlay.id = 'auth-gate';
overlay.innerHTML = `
  <div class="ag-card">
    <img src="assets/att-globe-white.svg" alt="AT&T" class="ag-logo">
    <h1>AT&amp;T Cloud Control</h1>
    <p class="ag-sub">Sign in with your AT&T email</p>
    <form id="ag-email-form">
      <input id="ag-email" type="email" placeholder="yourname@att.com" autocomplete="email" autofocus>
      <button type="submit">Send code</button>
      <p class="ag-error" id="ag-error"></p>
    </form>
    <form id="ag-code-form" hidden>
      <p class="ag-sub">Enter the 6-digit code we emailed you.<br>No email after a minute? Check your junk folder.</p>
      <input id="ag-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000">
      <button type="submit">Verify</button>
      <p class="ag-error" id="ag-code-error"></p>
    </form>
  </div>`;

const css = document.createElement('style');
css.textContent = `
  #auth-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#0057b8,#003d82 50%,#001a4d)}
  #auth-gate .ag-card{background:#fff;border-radius:16px;padding:40px;max-width:420px;width:92%;
    text-align:center;font-family:"ATT Aleck Sans",system-ui,sans-serif;color:#1d2329}
  #auth-gate .ag-logo{height:56px;margin-bottom:12px}
  #auth-gate h1{font-size:22px;margin:0 0 4px}
  #auth-gate .ag-sub{color:#686e74;font-size:14px;margin:0 0 16px}
  #auth-gate input{width:100%;height:44px;border:1px solid #686e74;border-radius:8px;padding:0 12px;
    font-size:14px;margin-bottom:12px;box-sizing:border-box;color:#1d2329;background:#fff}
  #auth-gate button{width:100%;height:44px;border:0;border-radius:8px;background:#0057b8;color:#fff;
    font-size:14px;font-weight:500;cursor:pointer}
  #auth-gate .ag-error{color:#c70032;font-size:12px;min-height:16px;margin:8px 0 0}
  body.ag-locked > :not(#auth-gate){visibility:hidden}`;
document.head.append(css);

function unlock(){ document.body.classList.remove('ag-locked'); overlay.remove(); }

const { data: { session } } = await supabase.auth.getSession();
if (session) { unlock(); } else {
  document.body.append(overlay);
  let email = '';
  document.getElementById('ag-email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('ag-error');
    email = document.getElementById('ag-email').value.toLowerCase().trim();
    if (!email.endsWith('@att.com')) { err.textContent = 'Only @att.com email addresses are allowed'; return; }
    err.textContent = '';
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) { err.textContent = error.status === 429 ? 'Too many requests - wait a minute.' : (error.message || 'Failed to send code'); return; }
    document.getElementById('ag-email-form').hidden = true;
    document.getElementById('ag-code-form').hidden = false;
    document.getElementById('ag-code').focus();
  });
  document.getElementById('ag-code-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('ag-code-error');
    const token = document.getElementById('ag-code').value.trim();
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) { err.textContent = 'Invalid or expired code. Request a new one.'; return; }
    unlock();
  });
}
```

- [ ] **Step 3: `index.html`:** add `class="ag-locked"` directly on the `<body>` tag (locked from first paint - no content flash), and before `</body>`: `<script type="module" src="js/auth-gate.js"></script>`. Because the class is inline and the script is local (vendored), the only way the page stays blank is the script failing to parse - which Step 5's test catches.
- [ ] **Step 4:** Playwright spec `tests/auth-gate.spec.js` mirroring Task 3 Step 7 (this repo already runs Playwright): stub `**/auth/v1/otp**` and `**/auth/v1/verify**`; assert content hidden while locked, bad-domain error, code step appears, bad code keeps it locked. Run → fails before Steps 1-3, passes after.
- [ ] **Step 5:** `npm run serve`, manual walk + **[HUMAN]** real-code unlock; confirm the app initializes normally after `unlock()` (its JS ran underneath the whole time - expected under this threat model). Confirm no request leaves for esm.sh (DevTools network filter).
- [ ] **Step 6:** Commit, deploy (repo `deploy.yml`), live walk + SSO check.

### Task 8: Close the loop

- [ ] **Step 1:** Post-demo Monday: lift the freeze note; one incognito sweep of all four live sites - a single sign-in should unlock all four (the SSO proof).
- [ ] **Step 2:** Record in each repo's README: auth model, kill-switch command, and the honest threat-model note (bundle is public; gate controls use, not secrecy).
- [ ] **Step 3:** Revisit D3 (server-gated hosting) and D2 (analyst allowlist) based on how Monday goes.

## Failure-Mode Ledger

| Failure | Counter |
|---|---|
| Email never arrives (SMTP limits) | Task 1 gate: delivery proven by curl before any code ships; custom SMTP mandatory; rate limit raised to 100/hr |
| Proofpoint scanner consumes the token | **Code-only template** - no link exists to scan (Rev 2 #1); codes can't be "clicked" |
| Cross-device / PKCE link failures | No links at all; codes are device-agnostic |
| Curl + anon key bypasses the domain check | Task 2 hook (or trigger fallback); verified by the exact curl in Task 2 Step 4 |
| DevTools localStorage forgery (the old hole) | Supabase mode ignores `att_nb_user`; enforced by a dedicated e2e test (Task 3 Step 7) and re-checked live (Task 4 Step 3) |
| Touching live PVE auth breaks a working app pre-demo | Eliminated: dedicated att-gate project; PVE untouched (Rev 2 #2) |
| New auth bricks cloud-connect | `VITE_AUTH_MODE=gate` kill switch, drill-timed with the command in the README (runnable via phone call); deploy freeze Sunday 18:00 |
| Venue network blocks `*.supabase.co` | Task 0 reachability probe on the actual machine/network; fallback = gate-mode deploy |
| Ramesh can't log in at the venue | Pre-persisted session from Sunday dry run on the presenting machine; worst case = one code from his phone; Monday 07:00 smoke test |
| Supabase 429 during live login | 60s resend cooldown with countdown in the UI; 429s surfaced with a human message |
| Legacy e2e suites break (helpers use `att_nb_user`) | CI runs them against a gate-mode build; auth spec runs separately against supabase mode (Task 3 Step 6) |
| Desktop/Electron builds hit an impossible email gate | `IS_OFFLINE_CAPABLE` bypass on `file:` protocol ONLY. A UA-based bypass was tried and failed live: every Electron-shell browser (Slack/Discord webviews, Claude pane) bypassed the gate. Regression-tested in e2e-auth. Netbond's Electron build must load via file:// - verify at Task 5 |
| esm.sh outage blanks cloud-control | supabase-js vendored locally; body locked from first paint with a local-only script path |
| Email in spam | "Check your junk folder" copy on every code screen; deliverability proven in Task 1 |
| Other three apps regress the demo | They deploy only after cloud-connect verifies; separate repos and deploys |

## Task 1 outputs (fill in when created)

- `ATT_GATE_URL`: _pending_
- `ATT_GATE_PUBLISHABLE_KEY`: _pending_
- (Reference only - PVE project, the reuse fallback: `https://yttpppvuzurerzhsrzmi.supabase.co`)
