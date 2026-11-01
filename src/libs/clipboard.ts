/**
 * Copies `text` to the system clipboard. Resolves `true` on success, `false`
 * when the Clipboard API is unavailable (insecure context, old browser) or
 * the write is denied — callers surface the outcome, never throw.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard?.writeText) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
