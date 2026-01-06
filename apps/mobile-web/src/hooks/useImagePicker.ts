import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/services/supabase';

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

interface UseImagePickerResult {
  pickImage: () => Promise<string | null>;
  uploadAvatar: (uri: string, userId: string) => Promise<string>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useImagePicker(): UseImagePickerResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const pickImage = useCallback(async (): Promise<string | null> => {
    setError(null);

    try {
      // Request permission
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Permission to access media library was denied');
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick image';
      setError(message);
      return null;
    }
  }, []);

  const uploadAvatar = useCallback(async (uri: string, userId: string): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      // Use fixed filename so it overwrites the previous avatar
      const filename = 'avatar.jpg';
      const path = `${userId}/${filename}`;

      let fileData: ArrayBuffer;

      if (Platform.OS === 'web') {
        // On web, fetch the blob from the URI
        const response = await fetch(uri);
        fileData = await response.arrayBuffer();
      } else {
        // On native, fetch and read as blob, then convert to ArrayBuffer
        const response = await fetch(uri);
        const blob = await response.blob();

        // Convert blob to base64 using FileReader
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data URL prefix (data:image/jpeg;base64,)
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        fileData = base64ToArrayBuffer(base64);
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL with cache-busting parameter
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Add timestamp to prevent caching old image
      return `${publicUrl}?t=${Date.now()}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    pickImage,
    uploadAvatar,
    isUploading,
    error,
    clearError,
  };
}
