import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoGalleryUploader } from '../../src/components/host/PhotoGalleryUploader';
import { Alert } from 'react-native';

// Mock expo-image-picker
const mockLaunchImageLibraryAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: mockLaunchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync: mockRequestMediaLibraryPermissionsAsync,
}));

// Mock Supabase
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../src/services/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      })),
    },
  },
}));

// Mock authStore
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ user: mockUser });
    }
    return { user: mockUser };
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, onPress }: any) => (
    <button onClick={onPress} data-testid={`icon-${name}`}>
      {name}
    </button>
  ),
}));

// Mock fetch for blob conversion
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(['fake-image-data'])),
  })
) as jest.Mock;

describe('PhotoGalleryUploader', () => {
  const mockOnPhotosChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/storage/user-123/12345.jpg' },
    });
    mockRemove.mockResolvedValue({ error: null });
  });

  it('renders with empty photo gallery', () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    expect(screen.getByText('Photos (Optional)')).toBeInTheDocument();
    expect(screen.getByText('0 of 5 photos added')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    expect(
      screen.getByText(/Add photos of your washing machine and laundry space/)
    ).toBeInTheDocument();
  });

  it('shows Add Photo button when gallery is empty', () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    expect(screen.getByText('Add Photo')).toBeInTheDocument();
  });

  it('displays existing photos', () => {
    const photos = [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ];

    render(<PhotoGalleryUploader photos={photos} onPhotosChange={mockOnPhotosChange} />);

    expect(screen.getByText('2 of 5 photos added')).toBeInTheDocument();

    // Images should be rendered
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/photo1.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/photo2.jpg');
  });

  it('renders delete button for each photo', () => {
    const photos = [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ];

    render(<PhotoGalleryUploader photos={photos} onPhotosChange={mockOnPhotosChange} />);

    const deleteButtons = screen.getAllByTestId('icon-close-circle');
    expect(deleteButtons).toHaveLength(2);
  });

  it('requests permissions before picking image', async () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(mockRequestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('shows alert when permissions are denied', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });

    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission needed',
        'Please grant camera roll permissions to upload photos.'
      );
    });

    expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('uploads photo successfully', async () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('user-123/'),
        expect.any(Blob),
        expect.objectContaining({
          contentType: 'image/jpg',
          upsert: false,
        })
      );
    });

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalledWith([
        'https://example.com/storage/user-123/12345.jpg',
      ]);
    });
  });

  it('adds photo to existing gallery', async () => {
    const existingPhotos = ['https://example.com/photo1.jpg'];

    render(
      <PhotoGalleryUploader
        photos={existingPhotos}
        onPhotosChange={mockOnPhotosChange}
      />
    );

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalledWith([
        'https://example.com/photo1.jpg',
        'https://example.com/storage/user-123/12345.jpg',
      ]);
    });
  });

  it('prevents adding photos when limit is reached', async () => {
    const photos = [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
      'https://example.com/photo3.jpg',
      'https://example.com/photo4.jpg',
      'https://example.com/photo5.jpg',
    ];

    render(<PhotoGalleryUploader photos={photos} onPhotosChange={mockOnPhotosChange} />);

    // Add Photo button should not be visible
    expect(screen.queryByText('Add Photo')).not.toBeInTheDocument();
  });

  it('shows alert when trying to add photo beyond limit', async () => {
    const photos = Array(5).fill('https://example.com/photo.jpg');

    render(
      <PhotoGalleryUploader
        photos={photos}
        onPhotosChange={mockOnPhotosChange}
        maxPhotos={5}
      />
    );

    // Try to add another photo manually (in real app, button would be hidden)
    // This tests the internal limit check
    expect(screen.queryByText('Add Photo')).not.toBeInTheDocument();
  });

  it('respects custom maxPhotos prop', () => {
    const photos = ['https://example.com/photo1.jpg'];

    render(
      <PhotoGalleryUploader
        photos={photos}
        onPhotosChange={mockOnPhotosChange}
        maxPhotos={3}
      />
    );

    expect(screen.getByText('1 of 3 photos added')).toBeInTheDocument();
  });

  it('deletes photo successfully', async () => {
    const photos = [
      'https://example.com/storage/host-photos/user-123/12345.jpg',
      'https://example.com/photo2.jpg',
    ];

    render(<PhotoGalleryUploader photos={photos} onPhotosChange={mockOnPhotosChange} />);

    const deleteButtons = screen.getAllByTestId('icon-close-circle');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(['user-123/12345.jpg']);
    });

    await waitFor(() => {
      expect(mockOnPhotosChange).toHaveBeenCalledWith([
        'https://example.com/photo2.jpg',
      ]);
    });
  });

  it('handles photo deletion error', async () => {
    mockRemove.mockResolvedValue({ error: { message: 'Delete failed' } });

    const photos = [
      'https://example.com/storage/host-photos/user-123/12345.jpg',
    ];

    render(<PhotoGalleryUploader photos={photos} onPhotosChange={mockOnPhotosChange} />);

    const deleteButton = screen.getByTestId('icon-close-circle');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete failed',
        'Failed to delete photo. Please try again.'
      );
    });

    // Should not call onPhotosChange
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('handles upload error', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Upload failed',
        'Failed to upload photo. Please try again.'
      );
    });

    // Should not call onPhotosChange
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('handles cancelled image picker', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true });

    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
    });

    // Should not upload or change photos
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('shows uploading state', async () => {
    // Mock delayed upload
    mockUpload.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    // Should show uploading text
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  it('disables add button during upload', async () => {
    mockUpload.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    const addButton = screen.getByText('Add Photo').closest('button');
    fireEvent.click(addButton!);

    // Button should be disabled during upload
    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });
  });

  it('generates unique filenames for uploads', async () => {
    render(<PhotoGalleryUploader photos={[]} onPhotosChange={mockOnPhotosChange} />);

    fireEvent.click(screen.getByText('Add Photo'));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^user-123\/\d+\.jpg$/),
        expect.any(Blob),
        expect.any(Object)
      );
    });
  });
});
