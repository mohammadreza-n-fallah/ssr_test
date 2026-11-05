// Admin dashboard (/dashboard/*) resource types.

export interface AdminCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  parent: number | null;
  parent_name: string | null;
  image: string | null;
  icon: string;
  description: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  product_count: number;
  created_at: string;
}

export interface AdminBrand {
  id: number;
  name: string;
  name_fa: string;
  slug: string;
  logo: string | null;
  country: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export interface AdminVariant {
  id: number;
  product: number;
  product_name: string;
  sku: string;
  price: string;
  compare_price: string | null;
  stock: number;
  low_stock_threshold: number;
  part_type: string;
  attributes: Record<string, unknown>;
  is_active: boolean;
  weight: string | null;
  is_low_stock: boolean;
  discount_percent: number;
}

export interface AdminProductImage {
  id: number;
  product: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface AdminCompatibility {
  id: number;
  product: number;
  car_brand: number | null;
  car_brand_name: string | null;
  car_model: number | null;
  car_model_name: string | null;
  car_year: number | null;
  car_year_label: number | null;
  notes: string;
}

export interface AdminProductListItem {
  id: number;
  name: string;
  sku: string;
  oem_code: string;
  category: number | null;
  category_name: string | null;
  brand: number | null;
  brand_name: string | null;
  part_type: string;
  is_active: boolean;
  is_featured: boolean;
  price: number;
  stock: number;
  variant_count: number;
  primary_image: string | null;
  view_count: number;
  created_at: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  sku: string;
  oem_code: string;
  part_number: string;
  category: number | null;
  category_name: string | null;
  brand: number | null;
  brand_name: string | null;
  part_type: string;
  description: string;
  short_description: string;
  weight: string;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  view_count: number;
  variants: AdminVariant[];
  images: AdminProductImage[];
  compatibilities: AdminCompatibility[];
  created_at: string;
  updated_at: string;
}

export interface AdminOrderItem {
  id: number;
  variant: number;
  product_name: string;
  variant_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface AdminOrderListItem {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  customer_name: string;
  customer_phone: string;
  total: string;
  items_count: number;
  tracking_code: string;
  created_at: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  customer_id: number;
  customer_email: string;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  coupon_code: string;
  notes: string;
  shipping_method: string;
  estimated_delivery: string | null;
  address: {
    id: number;
    title: string;
    province: string;
    city: string;
    address: string;
    postal_code: string;
    receiver_name: string;
    receiver_phone: string;
  } | null;
  items: AdminOrderItem[];
  updated_at: string;
}

export interface AdminCustomer {
  id: number;
  phone: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  national_code: string;
  avatar: string | null;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

export interface AdminWarehouse {
  id: number;
  name: string;
  code: string;
  province: string;
  city: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  priority: number;
  is_active: boolean;
  ships_orders: boolean;
  stock_items_count: number;
  created_at: string;
}

export interface AdminStockItem {
  id: number;
  warehouse: number;
  warehouse_name: string;
  variant: number;
  variant_sku: string;
  product_name: string;
  quantity: number;
  reserved: number;
  available: number;
  bin_location: string;
}

export interface AdminStockMovement {
  id: number;
  warehouse: number;
  warehouse_name: string;
  variant: number;
  variant_sku: string;
  reason: string;
  reason_display: string;
  change: number;
  reference: string;
  note: string;
  created_at: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_type_display: string;
  value: string;
  max_discount: string | null;
  min_order_amount: string;
  usage_limit: number | null;
  usage_limit_per_user: number;
  used_count: number;
  first_order_only: boolean;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  categories: number[];
  products: number[];
  created_at: string;
}

export interface AdminFlashSaleItem {
  id: number;
  flash_sale: number;
  variant: number;
  variant_sku: string;
  product_name: string;
  sale_price: string;
  quantity_limit: number | null;
  sold_count: number;
}

export interface AdminFlashSale {
  id: number;
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  banner: string | null;
  items: AdminFlashSaleItem[];
  items_count: number;
  created_at: string;
}

export interface AdminReview {
  id: number;
  product: number;
  product_name: string;
  user: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  status_display: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  admin_reply: string;
  images: { id: number; image: string; alt_text: string }[];
  created_at: string;
}

export interface AdminBlogCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  is_active: boolean;
  post_count: number;
  created_at: string;
}

export interface AdminTag {
  id: number;
  name: string;
  slug: string;
}

export interface AdminPostListItem {
  id: number;
  title: string;
  slug: string;
  category: number | null;
  category_name: string | null;
  post_type: string;
  status: string;
  status_display: string;
  is_featured: boolean;
  author_name: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

export interface AdminPost {
  id: number;
  title: string;
  slug: string;
  author: number | null;
  category: number | null;
  post_type: string;
  cover: string | null;
  excerpt: string;
  body: string;
  tags: number[];
  related_products: number[];
  status: string;
  status_display: string;
  published_at: string | null;
  is_featured: boolean;
  reading_time: number;
  view_count: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export interface AdminComment {
  id: number;
  post: number;
  post_title: string;
  user: number;
  user_name: string;
  parent: number | null;
  body: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface AdminCarBrand {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  logo: string | null;
  is_active: boolean;
  sort_order: number;
  models_count: number;
}

export interface AdminCarModel {
  id: number;
  brand: number;
  brand_name: string;
  name: string;
  name_en: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  years_count: number;
}

export interface AdminCarYear {
  id: number;
  model: number;
  model_name: string;
  year: number;
  year_shamsi: string;
  engine: string;
  is_active: boolean;
}

export interface AdminShippingZone {
  id: number;
  name: string;
  provinces: string[];
  is_default: boolean;
}

export interface AdminShippingMethod {
  id: number;
  name: string;
  carrier: string;
  carrier_display: string;
  zone: number | null;
  zone_name: string | null;
  base_cost: string;
  per_kg_cost: string;
  free_shipping_threshold: string | null;
  estimated_days_min: number;
  estimated_days_max: number;
  use_carrier_api: boolean;
  is_active: boolean;
  sort_order: number;
}
