import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HostRegistrationScreen from '../../src/screens/host/HostRegistrationScreen';

// Mock useHost hook
const mockRegisterAsHost = jest.fn();
jest.mock('../../src/hooks/useHost', () => ({
  useHost: () => ({
    registerAsHost: mockRegisterAsHost,
    isRegistering: false,
    error: null,
  }),
}));

// Mock authStore
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
};
jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ user: mockUser });
    }
    return { user: mockUser };
  },
}));

// Mock host components
jest.mock('../../src/components/host/AddressAutocomplete', () => ({
  AddressAutocomplete: ({ onSelect }: any) => (
    <div data-testid="address-autocomplete">
      <button
        onClick={() =>
          onSelect({
            address: '123 Test St, Paris, France',
            coordinates: { lat: 48.8566, lng: 2.3522 },
          })
        }
        data-testid="select-address-button"
      >
        Select Address
      </button>
    </div>
  ),
}));

jest.mock('../../src/components/host/MachineTypeSelector', () => ({
  MachineTypeSelector: ({
    selectedType,
    description,
    onTypeChange,
    onDescriptionChange,
  }: any) => (
    <div data-testid="machine-type-selector">
      <button
        onClick={() => onTypeChange('front_load_washer')}
        data-testid="select-machine-type"
      >
        Select Front Load Washer
      </button>
      <input
        data-testid="description-input"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  ),
}));

jest.mock('../../src/components/host/PhotoGalleryUploader', () => ({
  PhotoGalleryUploader: ({ photos, onPhotosChange }: any) => (
    <div data-testid="photo-gallery-uploader">
      <button
        onClick={() => onPhotosChange([...photos, 'http://example.com/photo1.jpg'])}
        data-testid="add-photo-button"
      >
        Add Photo
      </button>
      <span data-testid="photo-count">{photos.length} photos</span>
    </div>
  ),
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

describe('HostRegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterAsHost.mockResolvedValue({
      id: 'host-123',
      user_id: 'user-123',
      is_active: false,
    });
  });

  it('renders initial step (address)', () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    expect(screen.getByText('Become a Host')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Where is your washing machine?')).toBeInTheDocument();
    expect(screen.getByTestId('address-autocomplete')).toBeInTheDocument();
  });

  it('shows progress bar with correct step', () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Step 1 indicator should be visible
    const progressBars = screen.getAllByTestId(/step-\d+-bar/);
    expect(progressBars).toHaveLength(3);
  });

  it('disables Next button when address not selected', () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button after address is selected', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByTestId('select-address-button'));

    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('progresses to machine type step', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Step 1: Select address
    fireEvent.click(screen.getByTestId('select-address-button'));

    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    // Click Next
    fireEvent.click(screen.getByTestId('next-button'));

    // Should show step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
      expect(screen.getByText('Tell us about your machine')).toBeInTheDocument();
      expect(screen.getByTestId('machine-type-selector')).toBeInTheDocument();
    });
  });

  it('allows going back to previous step', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Go to step 2
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });

    // Click Back
    fireEvent.click(screen.getByTestId('back-button'));

    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });
  });

  it('disables Next button on machine step when type not selected', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Go to step 2
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Next button should be disabled
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });
  });

  it('progresses to photos step', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Step 1: Select address
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Step 2: Select machine type
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-machine-type'));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Should show step 3
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
      expect(screen.getByText('Add photos (optional)')).toBeInTheDocument();
      expect(screen.getByTestId('photo-gallery-uploader')).toBeInTheDocument();
    });
  });

  it('completes registration with all data', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Step 1: Select address
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Step 2: Select machine type and add description
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-machine-type'));
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'My washing machine description' },
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Step 3: Add photos and submit
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('add-photo-button'));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Should call registerAsHost with correct data
    await waitFor(() => {
      expect(mockRegisterAsHost).toHaveBeenCalledWith({
        address: '123 Test St, Paris, France',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        machineType: 'front_load_washer',
        description: 'My washing machine description',
        photos: ['http://example.com/photo1.jpg'],
      });
    });

    // Should navigate back
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('allows submitting without optional fields', async () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Step 1: Select address
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Step 2: Select machine type only (no description)
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-machine-type'));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    // Step 3: Skip photos and submit
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Should call registerAsHost
    await waitFor(() => {
      expect(mockRegisterAsHost).toHaveBeenCalledWith({
        address: '123 Test St, Paris, France',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        machineType: 'front_load_washer',
        description: '',
        photos: [],
      });
    });
  });

  it('displays error when registration fails', async () => {
    mockRegisterAsHost.mockRejectedValue(new Error('Registration failed'));

    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Complete all steps
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-machine-type'));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Should display error
    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });

    // Should not navigate
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  it('shows Cancel button that navigates back', () => {
    render(<HostRegistrationScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows loading state during registration', async () => {
    // Mock a delayed registration
    mockRegisterAsHost.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<HostRegistrationScreen navigation={mockNavigation} />);

    // Complete all steps and submit
    fireEvent.click(screen.getByTestId('select-address-button'));
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-machine-type'));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });

    // Submit button should show loading state
    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });
  });
});
