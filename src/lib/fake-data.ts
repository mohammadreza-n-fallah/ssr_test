import type {
  Brand,
  CarBrand,
  CarModel,
  CarYear,
  Category,
  PaginatedResponse,
  Product,
  ProductImage,
  ProductVariant,
} from "@/types";

function svgDataUri(label: string, bg = "#e5e7eb", fg = "#1e3a8a"): string {
  const safe = label.slice(0, 18).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='${bg}'/><rect x='40' y='40' width='520' height='520' rx='28' fill='white' opacity='0.75'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='Tahoma,Arial,sans-serif' font-size='34' fill='${fg}'>${safe}</text><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='Tahoma,Arial,sans-serif' font-size='18' fill='#6b7280'>نمونه نمایشی</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function img(id: number, alt: string, primary = false): ProductImage {
  return { id, image: svgDataUri(alt), alt_text: alt, is_primary: primary };
}

function variant(
  id: number,
  sku: string,
  priceToman: number,
  stock: number,
  partType: "original" | "oem" | "aftermarket",
  compareToman?: number,
): ProductVariant {
  const price = priceToman * 10;
  const compare_price = compareToman ? compareToman * 10 : undefined;
  const discount_percent =
    compare_price && compare_price > price
      ? Math.round(((compare_price - price) / compare_price) * 100)
      : 0;
  return {
    id,
    sku,
    price,
    compare_price,
    stock,
    part_type: partType,
    attributes: { نوع: partType === "original" ? "اصل" : partType === "oem" ? "OEM" : "بازار" },
    is_active: true,
    discount_percent,
    is_in_stock: stock > 0,
    is_low_stock: stock > 0 && stock <= 5,
    flash_price: null,
  };
}

export const fakeCategories: Category[] = [
  { id: 1, name: "موتور و احتراق", name_en: "Engine", slug: "engine", icon: "engine", children: [] },
  { id: 2, name: "ترمز و ایمنی", name_en: "Brake", slug: "brake", icon: "brake", children: [] },
  { id: 3, name: "جلوبندی و تعلیق", name_en: "Suspension", slug: "suspension", icon: "suspension", children: [] },
  { id: 4, name: "برق و الکترونیک", name_en: "Electrical", slug: "electrical", icon: "electrical", children: [] },
  { id: 5, name: "روغن و فیلتر", name_en: "Oil & Filter", slug: "oil-filter", icon: "oil", children: [] },
];

export const fakeBrands: Brand[] = [
  { id: 1, name: "Bosch", name_fa: "بوش", slug: "bosch", country: "DE" },
  { id: 2, name: "Valeo", name_fa: "والئو", slug: "valeo", country: "FR" },
  { id: 3, name: "Denso", name_fa: "دنسو", slug: "denso", country: "JP" },
  { id: 4, name: "GMB", name_fa: "جی‌ام‌بی", slug: "gmb", country: "JP" },
  { id: 5, name: "ISK", name_fa: "آی‌اس‌کی", slug: "isk", country: "IR" },
];

const carYears = (modelId: number, start: number): CarYear[] =>
  [0, 1, 2, 3].map((i) => {
    const year = start + i;
    return {
      id: modelId * 10 + i + 1,
      year,
      year_shamsi: String(year - 621),
      engine: "1.6L",
    };
  });

export const fakeCarBrands: CarBrand[] = [
  { id: 1, name: "پژو", name_en: "Peugeot", slug: "peugeot" },
  { id: 2, name: "سمند", name_en: "Samand", slug: "samand" },
  { id: 3, name: "پراید", name_en: "Pride", slug: "pride" },
  { id: 4, name: "تیبا", name_en: "Tiba", slug: "tiba" },
  { id: 5, name: "دنا", name_en: "Dena", slug: "dena" },
];

export const fakeCarModelsByBrand: Record<string, CarModel[]> = {
  peugeot: [
    { id: 11, name: "206", name_en: "206", slug: "206", years: carYears(11, 2018) },
    { id: 12, name: "207", name_en: "207", slug: "207", years: carYears(12, 2019) },
  ],
  samand: [{ id: 21, name: "سورن", name_en: "Soren", slug: "soren", years: carYears(21, 2018) }],
  pride: [{ id: 31, name: "111", name_en: "111", slug: "111", years: carYears(31, 2017) }],
  tiba: [{ id: 41, name: "تیبا 2", name_en: "Tiba 2", slug: "tiba-2", years: carYears(41, 2019) }],
  dena: [{ id: 51, name: "پلاس", name_en: "Plus", slug: "dena-plus", years: carYears(51, 2020) }],
};

export const fakeProducts: Product[] = [
  {
    id: 1,
    name: "لنت ترمز جلو پژو 206",
    name_en: "Front Brake Pad Peugeot 206",
    slug: "front-brake-pad-peugeot-206",
    sku: "BRK-206-FR-001",
    oem_code: "4254.55",
    part_number: "ISK-BP206",
    category: fakeCategories[1],
    brand: fakeBrands[4],
    part_type: "aftermarket",
    short_description: "لنت ترمز جلو مناسب پژو 206 با عملکرد پایدار و صدای کم.",
    description: "محصول نمایشی برای اجرای فرانت‌اند بدون بک‌اند. مشخصات فنی و موجودی نمونه هستند.",
    primary_image: img(101, "لنت ترمز جلو", true),
    images: [img(101, "لنت ترمز جلو", true)],
    variants: [variant(1001, "BRK-206-FR-001", 890000, 12, "aftermarket", 990000)],
    default_variant: variant(1001, "BRK-206-FR-001", 890000, 12, "aftermarket", 990000),
    min_price: 890000 * 10,
    is_featured: true,
    view_count: 1240,
  },
  {
    id: 2,
    name: "فیلتر روغن سمند EF7",
    name_en: "Oil Filter Samand EF7",
    slug: "oil-filter-samand-ef7",
    sku: "OIL-SMND-EF7-002",
    oem_code: "OF-EF7",
    part_number: "BOS-OF77",
    category: fakeCategories[4],
    brand: fakeBrands[0],
    part_type: "oem",
    short_description: "فیلتر روغن با کیفیت فیلتراسیون بالا برای موتور EF7.",
    description: "محصول نمایشی. برای داده واقعی، بک‌اند را متصل کنید.",
    primary_image: img(102, "فیلتر روغن", true),
    images: [img(102, "فیلتر روغن", true)],
    variants: [variant(1002, "OIL-SMND-EF7-002", 245000, 30, "oem")],
    default_variant: variant(1002, "OIL-SMND-EF7-002", 245000, 30, "oem"),
    min_price: 245000 * 10,
    is_featured: true,
    view_count: 980,
  },
  {
    id: 3,
    name: "کمک فنر عقب پراید",
    name_en: "Rear Shock Absorber Pride",
    slug: "rear-shock-pride",
    sku: "SUS-PRD-RR-003",
    oem_code: "SA-PRD",
    part_number: "GMB-SH31",
    category: fakeCategories[2],
    brand: fakeBrands[3],
    part_type: "aftermarket",
    short_description: "کمک فنر عقب مناسب انواع پراید، سواری نرم‌تر.",
    description: "محصول نمایشی برای تست رابط کاربری فروشگاه.",
    primary_image: img(103, "کمک فنر عقب", true),
    images: [img(103, "کمک فنر عقب", true)],
    variants: [variant(1003, "SUS-PRD-RR-003", 1350000, 8, "aftermarket", 1490000)],
    default_variant: variant(1003, "SUS-PRD-RR-003", 1350000, 8, "aftermarket", 1490000),
    min_price: 1350000 * 10,
    is_featured: false,
    view_count: 760,
  },
  {
    id: 4,
    name: "کوئل دوبل تیبا",
    name_en: "Ignition Coil Tiba",
    slug: "ignition-coil-tiba",
    sku: "ELC-TIBA-CL-004",
    oem_code: "24510602",
    part_number: "VAL-IC22",
    category: fakeCategories[3],
    brand: fakeBrands[1],
    part_type: "oem",
    short_description: "کوئل احتراق با جرقه‌زنی یکنواخت برای تیبا و ساینا.",
    description: "محصول نمایشی. موجودی و قیمت نمونه است.",
    primary_image: img(104, "کوئل دوبل", true),
    images: [img(104, "کوئل دوبل", true)],
    variants: [variant(1004, "ELC-TIBA-CL-004", 1750000, 5, "oem")],
    default_variant: variant(1004, "ELC-TIBA-CL-004", 1750000, 5, "oem"),
    min_price: 1750000 * 10,
    is_featured: true,
    view_count: 540,
  },
  {
    id: 5,
    name: "واتر پمپ دنا پلاس",
    name_en: "Water Pump Dena Plus",
    slug: "water-pump-dena-plus",
    sku: "ENG-DENA-WP-005",
    oem_code: "WP-TU5P",
    part_number: "DNS-WP55",
    category: fakeCategories[0],
    brand: fakeBrands[2],
    part_type: "original",
    short_description: "واتر پمپ موتور توربو با آب‌بندی مقاوم.",
    description: "محصول نمایشی برای حالت بدون بک‌اند.",
    primary_image: img(105, "واتر پمپ", true),
    images: [img(105, "واتر پمپ", true)],
    variants: [variant(1005, "ENG-DENA-WP-005", 2980000, 4, "original", 3250000)],
    default_variant: variant(1005, "ENG-DENA-WP-005", 2980000, 4, "original", 3250000),
    min_price: 2980000 * 10,
    is_featured: true,
    view_count: 430,
  },
];

export function paginate<T>(items: T[], page = 1, pageSize = 12): PaginatedResponse<T> {
  const total_pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current_page = Math.min(Math.max(1, page), total_pages);
  const start = (current_page - 1) * pageSize;
  return {
    count: items.length,
    next: current_page < total_pages ? String(current_page + 1) : undefined,
    previous: current_page > 1 ? String(current_page - 1) : undefined,
    total_pages,
    current_page,
    results: items.slice(start, start + pageSize),
  };
}

export function fakeSearchProducts(params: URLSearchParams): PaginatedResponse<Product> {
  let items = [...fakeProducts];
  const category = params.get("category");
  const brand = params.get("brand");
  const partType = params.get("part_type");
  const featured = params.get("is_featured");
  const inStock = params.get("in_stock");
  const q = params.get("q") || params.get("search");
  if (category) items = items.filter((p) => p.category?.slug === category);
  if (brand) items = items.filter((p) => p.brand?.slug === brand);
  if (partType) items = items.filter((p) => p.part_type === partType);
  if (featured === "true") items = items.filter((p) => p.is_featured);
  if (inStock === "true") items = items.filter((p) => p.default_variant?.is_in_stock);
  if (q) {
    const qq = q.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(qq) ||
        p.name_en.toLowerCase().includes(qq) ||
        p.sku.toLowerCase().includes(qq) ||
        p.oem_code.toLowerCase().includes(qq),
    );
  }
  const ordering = params.get("ordering") || "-created_at";
  if (ordering === "variants__price") items.sort((a, b) => a.min_price - b.min_price);
  else if (ordering === "-variants__price") items.sort((a, b) => b.min_price - a.min_price);
  else if (ordering === "-view_count") items.sort((a, b) => b.view_count - a.view_count);
  else items.sort((a, b) => b.id - a.id);
  return paginate(items, Number(params.get("page") || 1), Number(params.get("page_size") || 12));
}

export function fakeProductBySlug(slug: string): Product | undefined {
  return fakeProducts.find((p) => p.slug === slug);
}

export function fakeSitemapData() {
  return {
    products: fakeProducts.map((p) => ({ slug: p.slug, updated_at: new Date().toISOString() })),
    categories: fakeCategories.map((c) => ({ slug: c.slug })),
    posts: [] as { slug: string; updated_at?: string }[],
    blog_categories: [] as { slug: string; updated_at?: string }[],
  };
}

export function fakeYearsForModel(modelId: number): CarYear[] {
  for (const models of Object.values(fakeCarModelsByBrand)) {
    const m = models.find((x) => x.id === modelId);
    if (m?.years) return m.years;
  }
  return [];
}
