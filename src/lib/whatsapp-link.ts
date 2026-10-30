/**
 * @fileOverview Utility to generate WhatsApp deep links for businesses.
 * Converts admin bot configuration to formatted wa.me deep links.
 */

/**
 * Generates the unique WhatsApp deep link URL for a given business ID.
 * The link formats the admin bot phone number and embeds the start query.
 *
 * @param businessId - The unique ID of the business tenant.
 * @returns The generated deep link URL.
 * @throws Error if the admin WhatsApp phone number is not configured in the environment variables.
 */
export function generateWhatsAppDeepLink(businessId: string): string {
  const envPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || process.env.ADMIN_WHATSAPP_PHONE;

  if (!envPhone) {
    throw new Error(
      "Failed to generate WhatsApp deep link: Admin WhatsApp phone number is not configured in environment variables (neither NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE nor ADMIN_WHATSAPP_PHONE is defined)."
    );
  }

  // Strip all non-numeric characters (e.g. +, spaces, dashes, parentheses)
  const sanitizedPhone = envPhone.replace(/\D/g, "");

  if (!sanitizedPhone) {
    throw new Error(
      `Failed to generate WhatsApp deep link: The configured admin phone number "${envPhone}" does not contain any digits.`
    );
  }

  // Ensure the business ID is trimmed and URL-safe when building the URL
  const trimmedId = businessId.trim();
  const encodedText = encodeURIComponent(`START:${trimmedId}`);

  return `https://wa.me/${sanitizedPhone}?text=${encodedText}`;
}
