/** Consistent section heading: numbered eyebrow, display title, gradient swoosh. */
export function SectionHeading({
  id,
  number,
  eyebrow,
  title,
  tone = "light",
  level = 2,
  className = "",
}: {
  id: string;
  number?: string;
  eyebrow: string;
  title: string;
  tone?: "light" | "dark";
  level?: 2 | 3;
  className?: string;
}) {
  const H = `h${level}` as "h2" | "h3";
  return (
    <div className={className}>
      <p className={`eyebrow flex items-center gap-2 ${tone === "dark" ? "text-ice-300" : "text-copper-700"}`}>
        {number ? (
          <span aria-hidden="true" className={`rounded-full px-2 py-0.5 text-[0.7rem] ${tone === "dark" ? "bg-white/10 text-white" : "bg-midnight-900 text-white"}`}>
            {number}
          </span>
        ) : null}
        {eyebrow}
      </p>
      <H id={id} className={`mt-3 text-display-lg uppercase ${tone === "dark" ? "text-white" : "text-midnight-900"}`}>
        {title}
      </H>
      <span aria-hidden="true" className="swoosh mt-4 block w-24" />
    </div>
  );
}
