import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Legacy Profile type (keeping for backward compatibility)
export type Profile = {
  id: string;
  business_name: string;
  description: string;
  whatsapp_number: string;
  category: string;
  images: string[];
  contact_methods: Record<string, any>;
  edit_token: string;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

// New types for marketplace
export type Seller = {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  whatsapp_number: string;
  phone_number?: string;
  email?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  location?: string;
  avatar_url?: string;
  cover_image_url?: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  total_sales: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity: number;
  is_available: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  seller?: Seller;
};

export type Service = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price?: number; // Made optional
  category: string;
  images: string[];
  duration_days?: number;
  is_available: boolean;
  availability_schedule: Record<string, any>;
  view_count: number;
  created_at: string;
  updated_at: string;
  seller?: Seller;
};

export type Inquiry = {
  id: string;
  seller_id: string;
  product_id?: string;
  service_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
  product?: Product;
  service?: Service;
};

export type Review = {
  id: string;
  seller_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
};

export type ShopSettings = {
  id: string;
  seller_id: string;
  business_hours: Record<string, any>;
  delivery_options: Record<string, any>;
  payment_methods: Record<string, any>;
  return_policy?: string;
  shipping_info?: string;
  created_at: string;
  updated_at: string;
};

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (password: string) => {
  return await supabase.auth.updateUser({ password });
};