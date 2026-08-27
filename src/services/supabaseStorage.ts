import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Converts a local file URI (from Expo ImagePicker or Audio) to an ArrayBuffer/Blob and uploads it to Supabase Storage.
 */
export async function uploadDentalMedia(
  uri: string,
  folder: 'photos' | 'audio',
  userId: string = 'anonymous'
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // If Supabase is not configured, return local URI for mock/local development
    return uri;
  }

  try {
    const ext = uri.split('.').pop() || (folder === 'photos' ? 'jpg' : 'm4a');
    const fileName = `${folder}/${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { data, error } = await supabase.storage
      .from('dental-media')
      .upload(fileName, arrayBuffer, {
        contentType: folder === 'photos' ? `image/${ext === 'png' ? 'png' : 'jpeg'}` : 'audio/m4a',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return uri; // Fallback to local URI
    }

    const { data: publicUrlData } = supabase.storage
      .from('dental-media')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Failed to upload media to Supabase:', err);
    return uri;
  }
}

export async function uploadDentalPhoto(uri: string, userId?: string): Promise<string> {
  const result = await uploadDentalMedia(uri, 'photos', userId);
  return result || uri;
}

export async function uploadDentalAudio(uri: string, userId?: string): Promise<string> {
  const result = await uploadDentalMedia(uri, 'audio', userId);
  return result || uri;
}
