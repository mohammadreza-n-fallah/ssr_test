export interface User {
  id: number;
  phone: string;
  email?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string | null;
  birth_date?: string | null;
  national_code?: string;
  is_verified: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface CarBrand {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  logo?: string;
}

export interface CarModel {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  image?: string;
  years?: CarYear[];
}

export interface CarYear {
  id: number;
  year: number;
  year_shamsi: string;
  engine: string;
}

export interface UserVehicle {
  id: number;
  car_brand: number;
  car_model: number;
  car_year?: number;
  nickname: string;
  plate_number: string;
  is_primary: boolean;
  car_brand_detail: CarBrand;
  car_model_detail: CarModel;
  car_year_detail?: CarYear;
  display_name: string;
}

export interface Category {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  image?: string;
  icon?: string;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  name_fa: string;
  slug: string;
  logo?: string;
  country: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  compare_price?: number;
  stock: number;
  part_type: string;
  attributes: Record<string, string>;
  is_active: boolean;
  discount_percent: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  flash_price?: number | null;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductCompatibility {
  id: number;
  car_brand?: CarBrand;
  car_model?: CarModel;
  car_year?: CarYear;
  notes: string;
}

export interface Product {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  sku: string;
  oem_code: string;
  part_number: string;
  category: Category;
  brand?: Brand;
  part_type: string;
  short_description: string;
  description?: string;
  primary_image?: ProductImage;
  images?: ProductImage[];
  variants?: ProductVariant[];
  default_variant?: ProductVariant;
  compatibilities?: ProductCompatibility[];
  min_price: number;
  is_featured: boolean;
  view_count: number;
}

export interface CartItem {
  id: number;
  variant: number;
  variant_detail: ProductVariant;
  // Backend returns primary_image as an absolute URL string (or null).
  product: { id: number; name: string; slug: string; primary_image?: string | null };
  quantity: number;
  subtotal: number;
  is_available: boolean;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  updated_at: string;
}

export interface Address {
  id: number;
  title: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  receiver_name: string;
  receiver_phone: string;
  is_default: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  address?: Address;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  tracking_code: string;
  items: Array<{
    id: number;
    product_name: string;
    variant_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  total_pages: number;
  current_page: number;
  results: T[];
}

// --- Phase 2 ---

export interface SearchSuggestion {
  name: string;
  slug: string;
  sku: string;
}

export interface FlashSaleItem {
  id: number;
  variant: number;
  variant_sku: string;
  product_name: string;
  product_slug: string;
  original_price: number;
  sale_price: number;
  quantity_limit?: number | null;
  sold_count: number;
  remaining?: number | null;
  is_available: boolean;
}

export interface FlashSale {
  id: number;
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  banner?: string;
  is_live: boolean;
  items: FlashSaleItem[];
}

export interface ShippingOption {
  method_id: number;
  carrier: string;
  name: string;
  cost: number;
  free: boolean;
  estimated_days_min: number;
  estimated_days_max: number;
}

export interface CouponResult {
  valid: boolean;
  code: string;
  product_discount: number;
  shipping_discount: number;
  total_discount: number;
}

export interface LoyaltyTransaction {
  id: number;
  points: number;
  type: string;
  type_display: string;
  description: string;
  created_at: string;
}

export interface LoyaltyAccount {
  balance: number;
  lifetime_earned: number;
  balance_rials: number;
  transactions: LoyaltyTransaction[];
}

export interface ReferralInfo {
  code: string;
  total_referrals: number;
  completed_referrals: number;
  points_earned: number;
  referrals: Array<{
    referred_phone: string;
    status: string;
    status_display: string;
    referrer_points: number;
    created_at: string;
  }>;
}

// --- Phase 3 ---

export interface ReviewImage {
  id: number;
  image: string;
  alt_text: string;
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user_name: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  admin_reply: string;
  images: ReviewImage[];
  created_at: string;
}

export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

export interface NotificationItem {
  id: number;
  category: string;
  category_display: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreference {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  order_updates: boolean;
  promotions: boolean;
  price_alerts: boolean;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_price?: number | null;
  current_price: number;
  price_dropped: boolean;
  created_at: string;
}

// --- Phase 4 ---

export interface BlogCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  post_count: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category?: BlogCategory;
  post_type: string;
  post_type_display: string;
  cover?: string;
  excerpt: string;
  author_name: string;
  is_featured: boolean;
  reading_time: number;
  view_count: number;
  published_at: string;
  body?: string;
  tags?: BlogTag[];
  related_products?: Product[];
  meta_title?: string;
  meta_description?: string;
}

export interface BlogComment {
  id: number;
  user_name: string;
  body: string;
  created_at: string;
  replies: BlogComment[];
}

export interface TicketMessage {
  id: number;
  sender_name: string;
  body: string;
  is_staff_reply: boolean;
  attachment?: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  status_display: string;
  priority: string;
  category: string;
  category_display: string;
  message_count: number;
  order_number?: string | null;
  last_reply_at: string;
  created_at: string;
  messages?: TicketMessage[];
}

export type ChatRole = "user" | "bot" | "agent";

export interface ChatMessage {
  id: number;
  role: ChatRole;
  role_display: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  subject: string;
  status: string;
  is_bot_handled: boolean;
  messages: ChatMessage[];
  created_at: string;
}

// --- Phase 5 (analytics dashboard + bulk import/export) ---

export interface SalesOverview {
  revenue: number;
  orders: number;
  items_sold: number;
  average_order_value: number;
  revenue_change_pct: number;
  orders_change_pct: number;
  pending_orders: number;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductStat {
  id: number;
  name: string;
  slug: string;
  quantity_sold: number;
  revenue: number;
}

export interface CategoryStat {
  id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
}

export interface OrderStatusStat {
  status: string;
  label: string;
  count: number;
}

export interface LowStockStat {
  variant_id: number;
  sku: string;
  product_id: number;
  product_name: string;
  stock: number;
  threshold: number;
}

export interface CustomerStats {
  new_customers: number;
  active_buyers: number;
  total_customers: number;
}

export interface AnalyticsDashboard {
  range: { from: string; to: string };
  overview: SalesOverview;
  timeseries: SalesPoint[];
  top_products: ProductStat[];
  top_categories: CategoryStat[];
  order_status: OrderStatusStat[];
  low_stock: LowStockStat[];
  customers: CustomerStats;
  inventory_value: number;
  pending: { reviews: number; comments: number; tickets: number };
}

export interface ImportSummary {
  rows: number;
  products_created: number;
  products_updated: number;
  variants_created: number;
  variants_updated: number;
  errors: string[];
}

// --- Call center (agent console) ---

export type CCPriority = "low" | "normal" | "high" | "urgent";
export type CCSentiment = "angry" | "neutral" | "happy" | "unknown";
export type CCQueueFilter =
  | "needs_human"
  | "unassigned"
  | "mine"
  | "all_open"
  | "closed";

export interface CCStats {
  needs_human: number;
  unassigned: number;
  mine: number;
  open_total: number;
  bot_handling: number;
  closed_today: number;
}

export interface CCAgentRef {
  id: number;
  name: string;
}

export interface CCQueueItem {
  id: number;
  status: string;
  is_bot_handled: boolean;
  unread: number;
  msg_count: number;
  updated_at: string;
  customer: { id: number; name: string; phone: string | null };
  assigned_agent: CCAgentRef | null;
  priority: CCPriority;
  tag: string;
  sentiment: CCSentiment;
  last_message: { role: ChatRole; body: string; created_at: string } | null;
}

export interface CCMeta {
  priority: CCPriority;
  priority_display: string;
  tag: string;
  tag_display: string;
  sentiment: CCSentiment;
  sentiment_display: string;
  ai_summary: string;
  analyzed_at: string | null;
}

export interface CCCustomerOrder {
  order_number: string;
  status: string;
  status_code: string;
  total: number;
  placed_on: string;
}

export interface CCCustomerVehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
}

export interface CCCustomerContext {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  joined: string | null;
  order_count: number;
  paid_count: number;
  total_spent: number;
  recent_orders: CCCustomerOrder[];
  vehicles: CCCustomerVehicle[];
}

export interface CCAgentNote {
  id: number;
  body: string;
  author_name: string;
  created_at: string;
}

export interface CCConversationDetail {
  id: number;
  status: string;
  is_bot_handled: boolean;
  assigned_agent: CCAgentRef | null;
  created_at: string;
  customer: CCCustomerContext;
  meta: CCMeta;
  messages: ChatMessage[];
  notes: CCAgentNote[];
  ai_enabled: boolean;
}

export interface CCCannedResponse {
  id: number;
  title: string;
  body: string;
  tag: string;
  tag_display: string;
  is_active: boolean;
  sort_order: number;
}
