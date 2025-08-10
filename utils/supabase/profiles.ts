import { supabase } from './client';
import { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  // Get user profile
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Create user profile
  static async createProfile(profileData: ProfileInsert): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update user profile
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete user profile
  static async deleteProfile(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Get or create profile
  static async getOrCreateProfile(userId: string, userData?: any): Promise<Profile> {
    let profile = await this.getProfile(userId);
    
    if (!profile) {
      profile = await this.createProfile({
        user_id: userId,
        full_name: userData?.user_metadata?.full_name || userData?.user_metadata?.name || null,
        email: userData?.email || null,
      });
    }
    
    return profile;
  }
}