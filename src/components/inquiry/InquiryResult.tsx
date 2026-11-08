"use client";

import { useEffect, useRef } from "react";
import { business } from "@/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { contactChannelPhrases, type InquiryState } from "@/lib/inquiry/schema";
import { CallLink } from "@/components/ui/CallLink";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { MailIcon } from "@/components/ui/icons";

type Sent = Extract<InquiryState, { status: "sent" }>;
type Fallback = Extract<InquiryState, { status: "fallback" }>;

function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="border-l-4 border-copper-700 bg-copper-100 px-4 py-3 text-ink">
      <p>
        <strong className="font-semibold">Demo form:</strong>{" "}
        {children ?? (
          <>
            submissions go to a test inbox, not to {business.founder.firstName} or his customers. To reach{" "}
            {business.founder.firstName} today, call{" "}
            <CallLink placement="contact-demo-notice" variant="plain" showNumber={false} className="font-semibold text-copper-800 underline underline-offset-4">
              {business.phone.display}
            </CallLink>
            .
          </>
        )}
      </p>
    </div>
  );
}

export function SentPanel({ state }: { state: Sent }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const name = state.firstName ? `Thanks, ${state.firstName}.` : "Thanks.";
  const channel = contactChannelPhrases[state.channel];
  const don = business.founder.firstName;

  let notice: React.ReactNode = null;
  let body: React.ReactNode;
  if (state.demo) {
    const where =
      state.delivery === "resend"
        ? "was delivered to the demo test inbox, not to Don or his customers"
        : "was delivered to the demo test sink and not sent to anyone";
    notice = (
      <DemoNotice>
        this was a test submission. Your request {where}. To reach {don} today, call{" "}
        <CallLink placement="contact-demo-success" variant="plain" showNumber={false} className="font-semibold text-copper-800 underline underline-offset-4">
          {business.phone.display}
        </CallLink>
        .
      </DemoNotice>
    );
    body = (
      <p>
        {name} On the live site, this request would go to {don}. It wouldn’t be a booked appointment yet: {don} would
        contact you by {channel} to confirm details and timing.
      </p>
    );
  } else {
    body = (
      <p>
        {name} Your request was sent to {don}. This isn’t a booked appointment yet: {don} will contact you by {channel}{" "}
        to confirm details and timing.
      </p>
    );
  }

  return (
    <div className="space-y-5 border border-success-700 bg-limestone-50 p-5 sm:p-7" role="status">
      <h3 ref={headingRef} tabIndex={-1} className="text-display-md uppercase text-midnight-900">
        {state.demo ? "Demo request received" : "Request sent"}
      </h3>
      {notice}
      <div className="text-lg text-ink">{body}</div>
      <p className="text-ink-muted">
        If your heat or hot water is out, calling is the quickest way to reach {don}.
      </p>
      <CallLink placement="contact-success" variant="secondary" />
    </div>
  );
}

export function FallbackPanel({ state }: { state: Fallback }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const don = business.founder.firstName;
  return (
    <div className="space-y-5 border-2 border-copper-700 bg-limestone-50 p-5 sm:p-7" role="alert">
      <h3 ref={headingRef} tabIndex={-1} className="text-display-md uppercase text-midnight-900">
        Your request has not been sent yet.
      </h3>
      <p className="text-lg text-ink">
        This website couldn’t send it just now. Your details are still in the form below. Please call {don}, or open
        an email draft with your request filled in and send it yourself.
      </p>
      {state.demo ? (
        <DemoNotice>
          this is the demo site. The email draft is marked “[DEMO TEST]” in its subject line.
        </DemoNotice>
      ) : null}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <CallLink placement="contact-fallback" />
        <a
          href={state.mailto}
          className={buttonClasses("secondary")}
          onClick={() => trackEvent("fallback_email", { placement: "contact-fallback", intent: state.intent, service: state.service })}
        >
          <MailIcon />
          <span>Email my request</span>
        </a>
      </div>
      <p className="text-sm text-ink-muted">
        “Email my request” opens a draft to {business.email} in your email app. Nothing is sent until you select Send
        there.
      </p>
    </div>
  );
}
