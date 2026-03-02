/**
 * User Model
 * Represents user data from Supabase auth.users table
 * Note: This mirrors Supabase's user structure for type safety
 */

import { BaseEntity } from './BaseModel.js';

/**
 * User interface matching Supabase auth.users structure
 */
export interface User extends BaseEntity {
  email: string;
  email_confirmed_at?: Date;
  phone?: string;
  phone_confirmed_at?: Date;
  last_sign_in_at?: Date;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  role?: string;
  aud?: string;
  confirmation_token?: string;
  email_change?: string;
  email_change_token_new?: string;
  recovery_token?: string;
}

/**
 * Simplified user profile for API responses
 */
export interface UserProfile {
  id: string;
  email: string;
  role?: string;
  created_at: Date;
  last_sign_in_at?: Date;
  // Add custom profile fields here as needed
  display_name?: string;
  avatar_url?: string;
}

/**
 * User profile update payload
 */
export interface UpdateUserProfilePayload {
  display_name?: string;
  avatar_url?: string;
  // Add other updatable profile fields here
}
