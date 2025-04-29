
export type UserType = 'customer' | 'provider';

export interface Job {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  category_id: string;
  budget_min: number | null;
  budget_max: number | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  preferred_date: string | null;
  is_emergency: boolean;
  is_fix_now: boolean;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  category?: ServiceCategory;
  bids_count?: number;
}

export interface JobWithBids extends Job {
  bids: Bid[];
}

export interface Bid {
  id: string;
  job_id: string;
  provider_id: string;
  amount: number;
  description: string | null;
  estimated_hours: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  provider?: ServiceProvider;
  job?: Job;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  business_name: string | null;
  description: string | null;
  services: string[] | null;
  years_experience: number;
  hourly_rate: number | null;
  availability: string[] | null;
  is_verified: boolean;
  is_available_emergency: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
}

export interface CustomerProfile {
  id: string;
  address: string | null;
  preferred_contact_method: string | null;
  saved_payment_methods: any | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  job_id: string;
  bid_id: string;
  customer_id: string;
  provider_id: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'not_paid' | 'paid' | 'refunded';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
  bid?: Bid;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    user_metadata: {
      full_name: string;
    };
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  job_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    user_metadata: {
      full_name: string;
    };
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}
