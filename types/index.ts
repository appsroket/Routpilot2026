// Shared application types for RoutePilot.
// These mirror the database schema in supabase/migrations/0001_init.sql.
//
// Convention: uuid/date/time/timestamptz columns are represented as `string`.

/** jobs.status check constraint */
export type JobStatus = "scheduled" | "en_route" | "completed" | "canceled";

/** profiles: extends auth.users with company info */
export interface Profile {
  id: string; // uuid — references auth.users(id)
  company_name: string | null;
  full_name: string | null;
  phone: string | null;
  home_base_address: string | null;
  home_base_lat: number | null;
  home_base_lng: number | null;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

/** technicians: field workers (receive SMS, not app users) */
export interface Technician {
  id: string;
  owner_id: string;
  name: string;
  phone: string; // E.164 format, e.g. +15551234567
  color: string;
  active: boolean;
  created_at: string;
}

/** customers: optional saved/repeat customers */
export interface Customer {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: string;
}

/** jobs: the core unit — a stop to visit */
export interface Job {
  id: string;
  owner_id: string;
  customer_id: string | null;
  technician_id: string | null;
  title: string;
  customer_name: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  scheduled_date: string; // date
  time_window_start: string | null; // time
  time_window_end: string | null; // time
  duration_min: number;
  sequence: number | null; // order in route after optimization
  eta: string | null; // timestamptz
  status: JobStatus;
  notes: string | null;
  created_at: string;
}

/** route_optimizations: log every optimize run (powers ROI metrics) */
export interface RouteOptimization {
  id: string;
  owner_id: string;
  technician_id: string | null;
  route_date: string; // date
  stop_count: number;
  baseline_distance_m: number | null;
  baseline_duration_s: number | null;
  optimized_distance_m: number | null;
  optimized_duration_s: number | null;
  distance_saved_m: number | null;
  duration_saved_s: number | null;
  created_at: string;
}

/** subscriptions: Stripe billing */
export interface Subscription {
  id: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
