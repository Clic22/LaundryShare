import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MachineTypeSelector } from '../../src/components/host/MachineTypeSelector';

describe('MachineTypeSelector', () => {
  const mockOnTypeChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all machine type options', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    expect(screen.getByText('Front-load Washer')).toBeInTheDocument();
    expect(screen.getByText('Top-load Washer')).toBeInTheDocument();
    expect(screen.getByText('Washer-Dryer Combo')).toBeInTheDocument();
    expect(screen.getByText('Commercial Washer')).toBeInTheDocument();
  });

  it('shows Machine Type label with required indicator', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    expect(screen.getByText('Machine Type *')).toBeInTheDocument();
  });

  it('shows Description label with optional indicator', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    expect(screen.getByText('Description (Optional)')).toBeInTheDocument();
  });

  it('highlights selected machine type', () => {
    const { container } = render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    // Front-load should be selected
    const frontLoadOption = screen.getByText('Front-load Washer').closest('button');
    expect(frontLoadOption).toHaveClass('optionSelected');

    // Others should not be selected
    const topLoadOption = screen.getByText('Top-load Washer').closest('button');
    expect(topLoadOption).not.toHaveClass('optionSelected');
  });

  it('calls onTypeChange when option is clicked', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const topLoadOption = screen.getByText('Top-load Washer');
    fireEvent.click(topLoadOption);

    expect(mockOnTypeChange).toHaveBeenCalledWith('top_load_washer');
  });

  it('allows changing selection between machine types', () => {
    const { rerender } = render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    // Click on washer-dryer combo
    const comboOption = screen.getByText('Washer-Dryer Combo');
    fireEvent.click(comboOption);

    expect(mockOnTypeChange).toHaveBeenCalledWith('washer_dryer_combo');

    // Rerender with new selection
    rerender(
      <MachineTypeSelector
        selectedType="washer_dryer_combo"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const comboButton = screen.getByText('Washer-Dryer Combo').closest('button');
    expect(comboButton).toHaveClass('optionSelected');
  });

  it('renders description textarea', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Tell potential customers about your setup/
    );
    expect(textarea).toBeInTheDocument();
  });

  it('displays current description value', () => {
    render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description="Modern eco-friendly machine"
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const textarea = screen.getByDisplayValue('Modern eco-friendly machine');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onDescriptionChange when description is typed', () => {
    render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Tell potential customers about your setup/
    );
    fireEvent.change(textarea, {
      target: { value: 'New washing machine with quick wash cycle' },
    });

    expect(mockOnDescriptionChange).toHaveBeenCalledWith(
      'New washing machine with quick wash cycle'
    );
  });

  it('shows helper text for description', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    expect(
      screen.getByText('A good description helps build trust with customers')
    ).toBeInTheDocument();
  });

  it('renders radio button indicators', () => {
    render(
      <MachineTypeSelector
        selectedType="commercial_washer"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    // All options should have radio indicators
    const options = screen.getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(4);

    // Selected option should show filled radio
    const commercialOption = screen.getByText('Commercial Washer').closest('button');
    const radioDot = commercialOption?.querySelector('.radioDot');
    expect(radioDot).toBeInTheDocument();
  });

  it('handles empty description', () => {
    render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Tell potential customers about your setup/
    );
    expect(textarea).toHaveValue('');
  });

  it('supports multiline description input', () => {
    render(
      <MachineTypeSelector
        selectedType="front_load_washer"
        description="Line 1\nLine 2\nLine 3"
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    const textarea = screen.getByDisplayValue('Line 1\nLine 2\nLine 3');
    expect(textarea).toBeInTheDocument();
  });

  it('all machine types have correct values', () => {
    render(
      <MachineTypeSelector
        selectedType=""
        description=""
        onTypeChange={mockOnTypeChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    );

    // Test each machine type calls with correct value
    fireEvent.click(screen.getByText('Front-load Washer'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('front_load_washer');

    fireEvent.click(screen.getByText('Top-load Washer'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('top_load_washer');

    fireEvent.click(screen.getByText('Washer-Dryer Combo'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('washer_dryer_combo');

    fireEvent.click(screen.getByText('Commercial Washer'));
    expect(mockOnTypeChange).toHaveBeenCalledWith('commercial_washer');
  });
});
