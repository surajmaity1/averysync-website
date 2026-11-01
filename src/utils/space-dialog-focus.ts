/**
 * Focus-return policy for the app-root space dialog.
 *
 * When a Radix dialog closes it focuses its trigger — with a plain `.focus()`,
 * so the browser scrolls the trigger into view. The active-space dialog is
 * opened programmatically from the persistent bar and has no real trigger; its
 * old sentinel sat at the end of <body>, so minimizing the space scrolled the
 * whole page to the bottom. Instead, suppress the default and hand focus back
 * to the control that opened the dialog (the bar's reopen button), explicitly
 * without scrolling.
 */

/** The subset of a focus event / element the policy needs. Lets tests inject fakes. */
type CloseFocusEvent = { preventDefault(): void }
type FocusTarget = { focus(options?: FocusOptions): void }

/**
 * Build an `onCloseAutoFocus` handler that refocuses `getTarget()` instead of
 * the dialog's trigger. The target is resolved at close time — the bar mounts
 * and unmounts with the session, so an element captured at render time could
 * be stale and detached by the time the dialog closes. A missing target still
 * suppresses the default (focus simply falls back to <body>, which never
 * scrolls).
 */
export const refocusOnClose =
  (getTarget: () => FocusTarget | null) =>
  (event: CloseFocusEvent): void => {
    event.preventDefault()
    getTarget()?.focus({ preventScroll: true })
  }
