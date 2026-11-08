import "server-only";
import type { ActionFailure } from "./types";

/**
 * Maps database / storage errors to plain messages for the owner. Raw error
 * text is never returned to the browser; only a short code is logged.
 */
interface DbLikeError {
  code?: string | null;
  message?: string | null;
}

export function logAdminError(context: string, error: unknown): void {
  // Codes only: no titles, descriptions, file names or emails in logs.
  const code =
    error && typeof error === "object" && "code" in error ? String((error as DbLikeError).code ?? "") : "";
  const name = error instanceof Error ? error.name : typeof error;
  console.error(`[admin] ${context} failed`, { code: code || undefined, kind: name });
}

export function friendlyDbError(context: string, error: unknown): ActionFailure {
  logAdminError(context, error);
  const e = (error ?? {}) as DbLikeError;
  const msg = e.message ?? "";
  switch (e.code) {
    case "42501":
      return { ok: false, code: "not-authorised", message: "Your account does not have editor access. Sign in again." };
    case "P0002":
      return { ok: false, code: "not-found", message: "This project could not be found. It may have been deleted." };
    case "40001":
      return {
        ok: false,
        code: "stale",
        message:
          "This project was changed somewhere else (another tab or device) while you were publishing. Reload the page, check your changes and publish again.",
      };
    case "P0001":
      return {
        ok: false,
        code: "stale",
        message: "This version is already live and cannot be changed. Reload the page and try again.",
      };
    case "22023":
      if (msg.includes("title")) {
        return { ok: false, code: "invalid", message: "Add a title of at least 3 characters before publishing." };
      }
      if (msg.includes("not prepared") || msg.includes("not ready")) {
        return {
          ok: false,
          code: "invalid",
          message: "One or more photos are still being prepared or failed to upload. Wait for them to finish, or remove them.",
        };
      }
      if (msg.includes("at most")) {
        return { ok: false, code: "invalid", message: "A project can have up to 12 photos." };
      }
      return { ok: false, code: "invalid", message: "Some of the details could not be saved. Check the form and try again." };
    case "23514":
      return { ok: false, code: "invalid", message: "One of the fields is too long or has an unsupported value." };
    case "PGRST301":
    case "PGRST302":
      return { ok: false, code: "not-authorised", message: "Your session has expired. Sign in again." };
    default:
      return {
        ok: false,
        code: "unavailable",
        message: "Something went wrong while talking to the website database. Your typing is still here; try again in a moment.",
      };
  }
}

export const NOT_AUTHORISED: ActionFailure = {
  ok: false,
  code: "not-authorised",
  message: "You are signed out or do not have editor access. Sign in again in a new tab, then try again here.",
};

export const NOT_CONFIGURED: ActionFailure = {
  ok: false,
  code: "unavailable",
  message: "The project editor is not connected to its database yet. Ask the site operator to finish setup.",
};
