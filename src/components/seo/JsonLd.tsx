// Server component that injects a JSON-LD <script> for structured data.
// Pass any of the builders from "@/lib/structuredData".
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema is built from trusted, server-side data — not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
