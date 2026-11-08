/** Gas-smell / carbon monoxide safety note. Shown before any "call Don" advice. */
export function SafetyNote({ className = "" }: { className?: string }) {
  return (
    <aside aria-labelledby="safety-title" className={`rounded-md border border-danger-700/25 border-l-4 border-l-danger-700 bg-white p-4 shadow-sm ${className}`}>
      <h3 id="safety-title" className="font-sans text-base font-bold text-danger-700">
        Smell gas or hear a carbon monoxide alarm?
      </h3>
      <p className="mt-2 text-sm text-ink">
        A rotten-egg smell can mean a gas leak. Leave the building with everyone in it, without switching anything on
        or off. Once you are outside, call your gas utility’s emergency line or 911. Call Don after the emergency
        responders say it is safe.
      </p>
    </aside>
  );
}
