/** Shared form styling for the owner editor (large touch targets, visible focus). */
export const inputClass =
  "block w-full min-h-12 rounded-sm border border-ink-soft bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink-soft aria-[invalid=true]:border-danger-700 aria-[invalid=true]:border-2";
export const textareaClass = `${inputClass} min-h-40 leading-relaxed`;
export const labelClass = "block text-base font-semibold text-ink";
export const helpClass = "mt-1 text-sm text-ink-muted";
export const errorClass = "mt-1.5 text-sm font-semibold text-danger-700";
export const sectionTitleClass = "font-display text-display-md uppercase text-midnight-900";

export const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-base font-semibold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const primaryButton = `${buttonBase} border border-copper-700 bg-copper-700 text-white hover:border-copper-800 hover:bg-copper-800`;
export const secondaryButton = `${buttonBase} border border-midnight-900 bg-white text-midnight-900 hover:bg-midnight-900 hover:text-limestone-50`;
export const quietButton = `${buttonBase} border border-ink-soft bg-white text-ink hover:border-midnight-900`;
export const dangerButton = `${buttonBase} border border-danger-700 bg-white text-danger-700 hover:bg-danger-700 hover:text-white`;
export const smallButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border border-ink-soft bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-midnight-900 disabled:cursor-not-allowed disabled:opacity-50";
