import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  return (
    process.env.REPLYIQ_SHARED_SECRET ||
    process.env.AGENT_PUBLISH_KEY ||
    "replyiq-preview-secure-secret-2026"
  );
}

/**
 * Generates a tamper-proof HMAC SHA256 token for a specific blog post ID.
 */
export function generatePreviewToken(postId: string): string {
  const secret = getSecret();
  return createHmac("sha256", secret).update(`replyiq-preview:${postId}`).digest("hex");
}

/**
 * Validates whether the given preview token matches the expected hash for the post ID in constant time.
 */
export function verifyPreviewToken(postId: string, token: string): boolean {
  if (!postId || !token) return false;
  const expectedToken = generatePreviewToken(postId);
  if (token.length !== expectedToken.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token, "utf-8"), Buffer.from(expectedToken, "utf-8"));
  } catch {
    return false;
  }
}
