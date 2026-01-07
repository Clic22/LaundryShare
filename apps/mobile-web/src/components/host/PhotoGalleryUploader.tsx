import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoGalleryUploader({ photos, onPhotosChange, maxPhotos = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera roll permissions to upload photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit reached', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('host-photos')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('host-photos')
        .getPublicUrl(filePath);

      onPhotosChange([...photos, data.publicUrl]);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload failed', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/host-photos/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];

        // Delete from Supabase Storage
        const { error } = await supabase.storage
          .from('host-photos')
          .remove([filePath]);

        if (error) throw error;
      }

      // Remove from local state
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Delete failed', 'Failed to delete photo. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos (Optional)</Text>
      <Text style={styles.description}>
        Add photos of your washing machine and laundry space. This helps build trust
        with potential customers.
      </Text>

      <View style={styles.gallery}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <Pressable
              style={styles.deleteButton}
              onPress={() => removePhoto(photo, index)}
            >
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </Pressable>
          </View>
        ))}

        {photos.length < maxPhotos && (
          <Pressable
            style={[styles.addButton, uploading && styles.addButtonDisabled]}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <Text style={styles.addButtonText}>Uploading...</Text>
            ) : (
              <>
                <Ionicons name="camera" size={32} color="#007AFF" />
                <Text style={styles.addButtonText}>Add Photo</Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      <Text style={styles.helperText}>
        {photos.length} of {maxPhotos} photos added
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});
