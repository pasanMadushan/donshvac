"use client";

import { Suspense, useActionState, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { business } from "@/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { getFormToken, submitInquiry } from "@/lib/inquiry/actions";
import {
  INQUIRY_INTENTS,
  INQUIRY_SERVICES,
  inquiryIntentLabels,
  inquiryServiceLabels,
  type InquiryIntent,
  type InquiryPrefill,
  type InquiryService,
} from "@/lib/inquiry/prefill";
import {
  CONTACT_CHANNELS,
  EMPTY_VALUES,
  FIELD,
  FIELD_ORDER,
  INITIAL_INQUIRY_STATE,
  LIMITS,
  PROPERTY_KINDS,
  contactChannelLabels,
  fieldId,
  propertyKindLabels,
  type ContactChannel,
  type InquiryFieldErrors,
  type InquiryState,
  type InquiryValues,
  type PropertyKind,
} from "@/lib/inquiry/schema";
import { CallLink } from "@/components/ui/CallLink";
import { DemoNotice, FallbackPanel, SentPanel } from "./InquiryResult";
import { PrefillReader } from "./PrefillReader";
import { FieldError, Hint, RadioGroup, TextAreaField, TextField, describedBy, inputClasses } from "./fields";

const intentHints: Record<InquiryIntent, string> = {
  service: "Something isn’t working, or it’s time for maintenance.",
  estimate: "You’re planning to replace or add a furnace, air conditioner, water heater or heat pump.",
  commercial: "A store, office, restaurant or other commercial building.",
  question: "Anything else you’d like to ask.",
};

const errorLabels: Record<(typeof FIELD_ORDER)[number], string> = {
  intent: "What you need",
  name: "Name",
  channel: "How to contact you",
  phone: "Phone number",
  email: "Email address",
  location: "City or postal code area",
  service: "Equipment or service",
  property: "Property type",
  description: "What’s happening",
  commercialBuilding: "Property or building type",
  commercialEquipment: "Equipment or system",
  commercialAccess: "Access notes",
  commercialTiming: "Timing",
  project: "Similar project",
};

const subscribeNoop = () => () => {};
/** false during SSR and hydration, true once React runs in the browser. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function newSubmissionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function asOneOf<T extends string>(list: readonly T[], value: string): T | "" {
  return (list as readonly string[]).includes(value) ? (value as T) : "";
}

interface Props {
  /** True on the demo site (passed from the server; never read site config here). */
  demo: boolean;
}

export function InquiryForm({ demo }: Props) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_INQUIRY_STATE);
  const [token, setToken] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [lastState, setLastState] = useState<InquiryState>(state);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Adjust local state when a new action result arrives (render-phase update).
  if (state !== lastState) {
    setLastState(state);
    setAttempt((n) => n + 1);
    if (state.status === "invalid" && state.freshToken) setToken(state.freshToken);
  }

  // Timing token + submission id: the page is static, so fetch them on mount.
  useEffect(() => {
    let live = true;
    getFormToken()
      .then((t) => {
        if (!live) return;
        setToken(t ?? "");
        setSubmissionId(newSubmissionId());
      })
      .catch(() => {
        if (live) setSubmissionId(newSubmissionId());
      });
    return () => {
      live = false;
    };
  }, []);

  // Move focus to the error summary; record accepted leads (no personal data).
  useEffect(() => {
    if (state.status === "invalid" || state.status === "rate_limited") summaryRef.current?.focus();
    if (state.status === "sent" && state.providerAccepted) {
      trackEvent("lead_accepted", {
        intent: state.intent,
        service: state.service,
        property: state.property,
        delivery: "resend",
      });
    }
  }, [state]);

  const onFirstInteraction = useCallback((intent: string, service: string) => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("request_start", {
      placement: "contact-form",
      ...(intent ? { intent } : {}),
      ...(service ? { service } : {}),
    });
  }, []);

  if (state.status === "sent") {
    return <SentPanel state={state} />;
  }

  const values: InquiryValues | null =
    state.status === "invalid" || state.status === "rate_limited" || state.status === "fallback" ? state.values : null;
  const errors: InquiryFieldErrors = state.status === "invalid" ? state.errors : {};
  const errorFields = FIELD_ORDER.filter((f) => errors[f]);
  const formMessage =
    state.status === "invalid" ? state.message : state.status === "rate_limited" ? state.message : undefined;
  const showSummary = errorFields.length > 0 || Boolean(formMessage);

  return (
    <div className="space-y-6">
      {demo ? <DemoNotice /> : null}

      {state.status === "fallback" ? <FallbackPanel state={state} /> : null}

      {showSummary ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="inquiry-error-title"
          className="border-2 border-danger-700 bg-limestone-50 p-5"
        >
          <h3 id="inquiry-error-title" className="text-2xl text-danger-700">
            {errorFields.length > 0 ? "Please check your request" : "Your request wasn’t sent yet"}
          </h3>
          {formMessage ? <p className="mt-2 text-ink">{formMessage}</p> : null}
          {errorFields.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {errorFields.map((f) => (
                <li key={f}>
                  <a
                    href={`#${fieldId(f)}`}
                    className="font-semibold text-danger-700 underline underline-offset-4"
                    onClick={(e) => {
                      const el = document.getElementById(fieldId(f));
                      if (el) {
                        e.preventDefault();
                        el.focus();
                        el.scrollIntoView({ block: "center" });
                      }
                    }}
                  >
                    {errorLabels[f]}: {errors[f]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {state.status === "rate_limited" ? (
            <div className="mt-4">
              <CallLink placement="contact-rate-limited" />
            </div>
          ) : null}
        </div>
      ) : null}

      <form action={formAction} aria-busy={pending} aria-labelledby="request-title" className="space-y-8">
        <FormFields
          key={attempt}
          initial={values}
          errors={errors}
          onFirstInteraction={onFirstInteraction}
        />

        {/* Timing token and duplicate-submit protection (absent without JS). */}
        <input type="hidden" name={FIELD.token} value={token} />
        <input type="hidden" name={FIELD.submissionId} value={submissionId} />

        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="inquiry-company-website">Company website</label>
          <input
            id="inquiry-company-website"
            type="text"
            name={FIELD.honeypot}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div className="space-y-4 border-t border-midnight-900/15 pt-6">
          <button
            type="submit"
            disabled={pending}
            aria-disabled={pending || undefined}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-copper-700 bg-copper-700 px-6 py-3 text-lg font-semibold text-white transition-colors hover:border-copper-800 hover:bg-copper-800 disabled:cursor-progress disabled:opacity-80 sm:w-auto"
          >
            {pending ? "Sending…" : "Send request"}
          </button>
          <p className="text-sm text-ink-muted" aria-live="polite">
            {pending ? "Sending your request…" : null}
          </p>
          <p className="text-sm text-ink-muted">
            Sending this form doesn’t book an appointment. {business.founder.firstName} will contact you to confirm
            details and timing. Your details are used only to reply to your request. See the{" "}
            <Link href="/privacy" className="text-copper-700 underline underline-offset-4">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}

interface FieldsProps {
  initial: InquiryValues | null;
  errors: InquiryFieldErrors;
  onFirstInteraction: (intent: string, service: string) => void;
}

function FormFields({ initial, errors, onFirstInteraction }: FieldsProps) {
  const v = initial ?? EMPTY_VALUES;
  const restored = initial !== null;
  const hydrated = useHydrated();

  const [intent, setIntent] = useState<InquiryIntent | "">(asOneOf(INQUIRY_INTENTS, v.intent));
  const [channel, setChannel] = useState<ContactChannel | "">(asOneOf(CONTACT_CHANNELS, v.channel));
  const [property, setProperty] = useState<PropertyKind | "">(
    asOneOf(PROPERTY_KINDS, v.property) || "residential",
  );
  const [service, setService] = useState<InquiryService | "">(asOneOf(INQUIRY_SERVICES, v.service));
  const [project, setProject] = useState(v.project);
  const [descLength, setDescLength] = useState(v.description.trim().length);

  const applyPrefill = useCallback(
    (p: InquiryPrefill) => {
      // A re-rendered form after a submit keeps what the visitor entered.
      if (restored) return;
      if (p.intent) setIntent(p.intent);
      if (p.service) setService(p.service);
      if (p.property) setProperty(p.property);
      if (p.intent === "commercial") setProperty("commercial");
      if (p.project) setProject(p.project);
    },
    [restored],
  );

  const chooseIntent = (next: InquiryIntent) => {
    setIntent(next);
    if (next === "commercial") setProperty("commercial");
  };

  const phoneRequired = channel === "phone" || channel === "text";
  const emailRequired = channel === "email";
  // Without JS every section is shown; with JS the commercial section follows
  // the property choice.
  const showCommercial = !hydrated || property === "commercial";
  const descId = fieldId("description");
  const descErrorId = errors.description ? `${descId}-error` : null;

  return (
    <div
      className="space-y-8"
      onChangeCapture={() => onFirstInteraction(intent, service)}
    >
      <Suspense fallback={null}>
        <PrefillReader onPrefill={applyPrefill} />
      </Suspense>

      {project ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-midnight-900 bg-midnight-100/60 px-4 py-3">
          <p>
            <strong className="font-semibold">Asking about a similar project</strong>{" "}
            <Link href={`/our-work/${project}`} className="text-copper-700 underline underline-offset-4">
              view the project<span className="sr-only"> you’re asking about</span>
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setProject("")}
            className="min-h-11 px-2 text-sm font-semibold text-midnight-900 underline underline-offset-4"
          >
            Remove<span className="sr-only"> the similar project reference</span>
          </button>
          <input type="hidden" name={FIELD.project} value={project} />
        </div>
      ) : null}
      <FieldError id={`${fieldId("project")}-error`} message={errors.project} />

      <RadioGroup
        idPrefix="inquiry-intent"
        name={FIELD.intent}
        legend="What do you need?"
        options={INQUIRY_INTENTS.map((value) => ({ value, label: inquiryIntentLabels[value], hint: intentHints[value] }))}
        value={intent}
        onChange={chooseIntent}
        error={errors.intent}
        required
      />

      <div className="grid gap-6">
        <TextField
          id={fieldId("name")}
          name={FIELD.name}
          label="Your name"
          autoComplete="name"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={LIMITS.name}
          defaultValue={v.name}
          error={errors.name}
          required
        />

        <RadioGroup
          idPrefix="inquiry-channel"
          name={FIELD.channel}
          legend={`How should ${business.founder.firstName} contact you?`}
          options={CONTACT_CHANNELS.map((value) => ({ value, label: contactChannelLabels[value] }))}
          value={channel}
          onChange={setChannel}
          error={errors.channel}
          layout="inline"
          required
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id={fieldId("phone")}
            name={FIELD.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            label="Phone number"
            hint={hydrated ? (phoneRequired ? "10 digits, like 647-555-0123." : "Optional for email replies.") : "Needed for a phone call or text."}
            maxLength={LIMITS.phone}
            defaultValue={v.phone}
            error={errors.phone}
            required={phoneRequired}
          />
          <TextField
            id={fieldId("email")}
            name={FIELD.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            label="Email address"
            hint={hydrated ? (emailRequired ? `${business.founder.firstName} will reply to this address.` : "Optional for a call or text.") : "Needed if you choose email."}
            maxLength={LIMITS.email}
            defaultValue={v.email}
            error={errors.email}
            required={emailRequired}
          />
        </div>

        <TextField
          id={fieldId("location")}
          name={FIELD.location}
          label="City or first three characters of postal code"
          hint="For example Brampton, or L6P. Please don’t enter your full postal code or street address. Not sure whether Don serves your area? Ask here."
          autoComplete="address-level2"
          maxLength={LIMITS.location}
          defaultValue={v.location}
          error={errors.location}
          required
        />

        <div>
          <label htmlFor={fieldId("service")} className="block font-semibold text-ink">
            Equipment or service
            <span className="ml-1 text-sm font-normal text-ink-muted">(required)</span>
          </label>
          <FieldError id={`${fieldId("service")}-error`} message={errors.service} />
          <select
            id={fieldId("service")}
            name={FIELD.service}
            value={service}
            onChange={(e) => setService(asOneOf(INQUIRY_SERVICES, e.target.value))}
            required
            aria-required
            aria-invalid={errors.service ? true : undefined}
            aria-describedby={errors.service ? `${fieldId("service")}-error` : undefined}
            className={`mt-2 ${inputClasses} ${errors.service ? "border-2 border-danger-700" : "border-midnight-900/50"}`}
          >
            <option value="">Choose one</option>
            {INQUIRY_SERVICES.map((s) => (
              <option key={s} value={s}>
                {inquiryServiceLabels[s]}
              </option>
            ))}
          </select>
        </div>

        <RadioGroup
          idPrefix="inquiry-property"
          name={FIELD.property}
          legend="Property type"
          options={PROPERTY_KINDS.map((value) => ({ value, label: propertyKindLabels[value] }))}
          value={property}
          onChange={setProperty}
          error={errors.property}
          layout="inline"
          required
        />

        <div>
          <label htmlFor={descId} className="block font-semibold text-ink">
            What’s happening?
            <span className="ml-1 text-sm font-normal text-ink-muted">(required)</span>
          </label>
          <Hint id={`${descId}-hint`}>
            Describe the problem or the project: what you’ve noticed, the equipment involved and anything you’ve
            already checked.
          </Hint>
          <FieldError id={`${descId}-error`} message={errors.description} />
          <textarea
            id={descId}
            name={FIELD.description}
            rows={6}
            required
            aria-required
            minLength={LIMITS.descriptionMin}
            maxLength={LIMITS.description}
            defaultValue={v.description}
            onChange={(e) => setDescLength(e.target.value.trim().length)}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy(descErrorId, `${descId}-hint`, `${descId}-count`)}
            className={`mt-2 ${inputClasses} ${errors.description ? "border-2 border-danger-700" : "border-midnight-900/50"}`}
          />
          <p id={`${descId}-count`} className="mt-1 text-sm text-ink-muted">
            {descLength < LIMITS.descriptionMin
              ? `At least ${LIMITS.descriptionMin} characters, up to ${LIMITS.description}.`
              : `${descLength} of ${LIMITS.description} characters`}
          </p>
          <p className="sr-only" aria-live="polite">
            {descLength >= LIMITS.description - 100 && descLength > 0
              ? `${LIMITS.description - descLength} characters left`
              : ""}
          </p>
        </div>
      </div>

      {showCommercial ? (
        <fieldset className="space-y-6 border border-midnight-900/25 bg-limestone-50/70 p-4 sm:p-6">
          <legend className="px-2 font-display text-2xl uppercase text-midnight-900">
            Commercial properties only (optional)
          </legend>
          <p className="text-sm text-ink-muted">
            These details help {business.founder.firstName} plan a visit to a commercial building. Leave them blank
            for a home.
          </p>
          <TextAreaField
            id={fieldId("commercialBuilding")}
            name={FIELD.commercialBuilding}
            label="Property or building type"
            hint="For example a retail unit, office, restaurant or multi-unit building."
            maxLength={LIMITS.commercial}
            defaultValue={v.commercialBuilding}
            error={errors.commercialBuilding}
            rows={2}
          />
          <TextAreaField
            id={fieldId("commercialEquipment")}
            name={FIELD.commercialEquipment}
            label="Equipment or system"
            hint="For example a rooftop unit, make-up air unit or boiler, if you know."
            maxLength={LIMITS.commercial}
            defaultValue={v.commercialEquipment}
            error={errors.commercialEquipment}
            rows={2}
          />
          <TextAreaField
            id={fieldId("commercialAccess")}
            name={FIELD.commercialAccess}
            label="Access notes"
            hint="Roof access, mechanical room location, keys or security check-in."
            maxLength={LIMITS.commercial}
            defaultValue={v.commercialAccess}
            error={errors.commercialAccess}
            rows={2}
          />
          <TextAreaField
            id={fieldId("commercialTiming")}
            name={FIELD.commercialTiming}
            label="Timing or scheduling window"
            hint="When work can happen at the property, for example before the store opens."
            maxLength={LIMITS.commercial}
            defaultValue={v.commercialTiming}
            error={errors.commercialTiming}
            rows={2}
          />
        </fieldset>
      ) : null}
    </div>
  );
}
