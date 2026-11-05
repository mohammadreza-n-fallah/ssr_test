interface Section {
  heading?: string;
  body: string;
}

interface Props {
  title: string;
  intro?: string;
  sections: Section[];
  updated?: string;
}

// Simple typographic layout for legal / help / informational pages.
export default function StaticArticle({ title, intro, sections, updated }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
        <span className="w-1.5 h-7 rounded-full bg-gradient-accent" />
        {title}
      </h1>
      {intro && <p className="text-gray-500 mb-6 leading-relaxed pr-4">{intro}</p>}

      <div className="bg-white ring-1 ring-gray-100 shadow-soft rounded-2xl p-6 space-y-6">
        {sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="font-bold text-gray-900 mb-2">{s.heading}</h2>
            )}
            <p className="text-sm text-gray-600 leading-loose whitespace-pre-line">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {updated && <p className="text-xs text-gray-400 mt-4">آخرین به‌روزرسانی: {updated}</p>}
    </div>
  );
}
