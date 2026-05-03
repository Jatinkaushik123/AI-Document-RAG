/**
 * Maps backend/network errors into user-friendly copy + optional toast severity.
 */

export type FriendlyError = { message: string; code: "auth" | "network" | "validation" | "unknown" };

const GENERIC = "Something went wrong. Try again.";
const NEED_DOC = "Please upload a document first.";
const NETWORK = "We couldn’t reach the server. Check your connection and try again.";

export function toFriendlyError(err: unknown, context?: "ask" | "upload" | "health"): FriendlyError {
  const raw =
    typeof err === "object" && err !== null && "message" in err && typeof (err as Error).message === "string"
      ? (err as Error).message
      : String(err);

  const t = raw.toLowerCase();

  if (context === "ask" || t.includes("ask failed") || t.includes("/ask")) {
    return { message: GENERIC, code: "unknown" };
  }
  if (context === "upload" && (t.includes("upload") || t.includes("500"))) {
    return { message: GENERIC, code: "unknown" };
  }

  if (t.includes("network") || t.includes("fetch") || t.includes("failed to fetch")) {
    return { message: NETWORK, code: "network" };
  }

  if (t.includes("no document indexed") || t.includes("upload a pdf") || t.includes("upload/embed")) {
    return { message: NEED_DOC, code: "validation" };
  }

  if (t.includes("401") || t.includes("unauthorized")) {
    return { message: GENERIC, code: "auth" };
  }

  if (t.includes("openai_api_key")) {
    return { message: "The assistant isn’t configured yet. Please try again later.", code: "unknown" };
  }

  const short = raw.length > 140 ? GENERIC : raw;
  return { message: short, code: "unknown" };
}
