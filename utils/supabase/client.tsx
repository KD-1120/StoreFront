import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tlemburwfooejvxqrxgo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZW1idXJ3Zm9vZWp2eHFyeGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzY0MTIsImV4cCI6MjA2OTkxMjQxMn0.0egPF5R0JcThem5Fd8m_DzQ2trBvXHtpoNVWsbXlnr0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to upload images
export const uploadImage = async (
  bucket: 'store-images' | 'product-images' | 'user-avatars',
  file: File,
  path?: string
): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${path || Date.now()}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      // Check if it's a bucket not found error
      if (error.message?.includes('Bucket not found') || error.message?.includes('404')) {
        throw new Error(`Storage bucket '${bucket}' not found. Please create the bucket in your Supabase dashboard under Storage > New bucket > '${bucket}' with public access enabled.`);
      }
      // Check for file size errors
      if (error.message?.includes('file size')) {
        throw new Error('File size too large. Please choose a smaller image.');
        throw new Error(`Storage bucket '${bucket}' not found. Please create the bucket in your Supabase dashboard under Storage > New bucket > '${bucket}' with public access enabled.`);
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Helper function to delete images
export const deleteImage = async (
  bucket: 'store-images' | 'product-images' | 'user-avatars',
  path: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};