import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AddressAutocomplete } from '@/components/host/AddressAutocomplete';
import { MachineTypeSelector } from '@/components/host/MachineTypeSelector';
import { PhotoGalleryUploader } from '@/components/host/PhotoGalleryUploader';
import { useHost } from '@/hooks/useHost';

type Step = 'address' | 'machine' | 'photos';

interface RegistrationData {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  machineType: string;
  description: string;
  photos: string[];
}

export default function HostRegistrationScreen() {
  const navigation = useNavigation();
  const { registerAsHost } = useHost();
  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    address: '',
    coordinates: null,
    machineType: '',
    description: '',
    photos: [],
  });

  const canProceed = {
    address: data.address && data.coordinates,
    machine: data.machineType,
    photos: true, // Photos are optional
  };

  const handleAddressSelect = (result: { address: string; coordinates: { lat: number; lng: number } }) => {
    setData((prev) => ({
      ...prev,
      address: result.address,
      coordinates: result.coordinates,
    }));
  };

  const handleMachineTypeChange = (machineType: string, description: string) => {
    setData((prev) => ({
      ...prev,
      machineType,
      description,
    }));
  };

  const handlePhotosChange = (photoUrls: string[]) => {
    setData((prev) => ({
      ...prev,
      photos: photoUrls,
    }));
  };

  const handleNext = () => {
    if (step === 'address' && canProceed.address) {
      setStep('machine');
    } else if (step === 'machine' && canProceed.machine) {
      setStep('photos');
    }
  };

  const handleBack = () => {
    if (step === 'machine') {
      setStep('address');
    } else if (step === 'photos') {
      setStep('machine');
    }
  };

  const handleComplete = async () => {
    if (!data.coordinates || !data.machineType) {
      return;
    }

    try {
      setLoading(true);
      await registerAsHost({
        address: data.address,
        coordinates: data.coordinates,
        machineType: data.machineType,
        description: data.description || undefined,
        photoUrls: data.photos.length > 0 ? data.photos : undefined,
      });

      // Navigate back to profile
      navigation.goBack();
    } catch (error) {
      console.error('Failed to register as host:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    address: 'Where are you located?',
    machine: 'Tell us about your machine',
    photos: 'Add photos (optional)',
  };

  const stepNumbers = {
    address: 1,
    machine: 2,
    photos: 3,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepIndicator}>
          Step {stepNumbers[step]} of 3
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(stepNumbers[step] / 3) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{stepTitles[step]}</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {step === 'address' && (
          <AddressAutocomplete
            onSelect={handleAddressSelect}
            initialValue={data.address}
          />
        )}

        {step === 'machine' && (
          <MachineTypeSelector
            selectedType={data.machineType}
            description={data.description}
            onTypeChange={(type) => handleMachineTypeChange(type, data.description)}
            onDescriptionChange={(desc) => handleMachineTypeChange(data.machineType, desc)}
          />
        )}

        {step === 'photos' && (
          <PhotoGalleryUploader
            photos={data.photos}
            onPhotosChange={handlePhotosChange}
            maxPhotos={5}
          />
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {step !== 'address' && (
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBack}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </Pressable>
        )}

        {step !== 'photos' && (
          <Pressable
            style={[
              styles.button,
              styles.buttonPrimary,
              !canProceed[step] && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed[step]}
          >
            <Text style={styles.buttonPrimaryText}>Next</Text>
          </Pressable>
        )}

        {step === 'photos' && (
          <Pressable
            style={[
              styles.button,
              styles.buttonPrimary,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={styles.buttonPrimaryText}>
              {loading ? 'Completing...' : 'Complete Registration'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#F2F2F7',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
