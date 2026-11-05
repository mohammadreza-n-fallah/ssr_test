// Schema.org (JSON-LD) builders for rich search results.
// Render the returned objects with the <JsonLd /> component.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "مِین استوریج";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: "فروشگاه آنلاین قطعات یدکی خودرو",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ProductSchemaInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sku?: string;
  brand?: string;
  price?: number;
  inStock?: boolean;
  ratingValue?: number;
  reviewCount?: number;
}

export function productSchema(p: ProductSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: `${SITE_URL}/products/${p.slug}`,
  };
  if (p.description) schema.description = p.description;
  if (p.image) schema.image = p.image;
  if (p.sku) schema.sku = p.sku;
  if (p.brand) schema.brand = { "@type": "Brand", name: p.brand };
  if (p.price != null) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: p.price,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${p.slug}`,
    };
  }
  if (p.ratingValue && p.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.ratingValue,
      reviewCount: p.reviewCount,
    };
  }
  return schema;
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  author?: string;
}

export function articleSchema(a: ArticleSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    url: `${SITE_URL}/blog/${a.slug}`,
    inLanguage: "fa-IR",
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
  if (a.description) schema.description = a.description;
  if (a.image) schema.image = a.image;
  if (a.publishedAt) schema.datePublished = a.publishedAt;
  if (a.author) schema.author = { "@type": "Person", name: a.author };
  return schema;
}

