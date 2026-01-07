import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

interface Props {
  selectedType: string;
  description: string;
  onTypeChange: (type: string) => void;
  onDescriptionChange: (description: string) => void;
}

const MACHINE_TYPES = [
  { value: 'front_load_washer', label: 'Front-load Washer' },
  { value: 'top_load_washer', label: 'Top-load Washer' },
  { value: 'washer_dryer_combo', label: 'Washer-Dryer Combo' },
  { value: 'commercial_washer', label: 'Commercial Washer' },
];

export function MachineTypeSelector({
  selectedType,
  description,
  onTypeChange,
  onDescriptionChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Machine Type *</Text>
      <View style={styles.optionsContainer}>
        {MACHINE_TYPES.map((type) => (
          <Pressable
            key={type.value}
            style={[
              styles.option,
              selectedType === type.value && styles.optionSelected,
            ]}
            onPress={() => onTypeChange(type.value)}
          >
            <View
              style={[
                styles.radio,
                selectedType === type.value && styles.radioSelected,
              ]}
            >
              {selectedType === type.value && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.optionText,
                selectedType === type.value && styles.optionTextSelected,
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={styles.textarea}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Tell potential customers about your setup, laundry space, detergents you use, etc."
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.helperText}>
        A good description helps build trust with customers
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
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#F9F9F9',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F4FF',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textarea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F9F9F9',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
