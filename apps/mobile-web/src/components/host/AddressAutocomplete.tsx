import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface AddressResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Props {
  onSelect: (result: AddressResult) => void;
  initialValue?: string;
}

export function AddressAutocomplete({ onSelect, initialValue }: Props) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Google Places API key is not configured.
        </Text>
        <Text style={styles.errorSubtext}>
          Please add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Enter your address"
        onPress={(data, details) => {
          if (details) {
            onSelect({
              address: data.description,
              coordinates: {
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
              },
            });
          }
        }}
        query={{
          key: apiKey,
          language: 'en',
          components: 'country:fr', // Restrict to France
        }}
        fetchDetails={true}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          predefinedPlacesDescription: styles.predefinedPlacesDescription,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        textInputProps={{
          placeholderTextColor: '#999',
          defaultValue: initialValue,
        }}
        enablePoweredByContainer={false}
      />
      <Text style={styles.helperText}>
        This will be visible to users looking for nearby hosts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F9F9F9',
  },
  predefinedPlacesDescription: {
    color: '#666',
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  description: {
    fontSize: 14,
    color: '#000',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#856404',
  },
});
