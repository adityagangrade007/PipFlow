/**
 * Email delivery service.
 *
 * The prototype has no email provider wired up. Messages are logged to the
 * server console so the full password-reset flow remains testable end-to-end.
 * Swap the body of these functions for a real provider (e.g. Resend, SES)
 * without touching any caller.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  console.info(
    `[email:password-reset] to=${to}\n  Reset link (valid 1 hour): ${resetUrl}`
  );
}
