/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { messages } from '../data/messages.ts';
import { QuantitySelector } from '../components/ui/QuantitySelector.tsx';

describe('QuantitySelector', () => {
  afterEach(() => {
    cleanup();
  });

  it('increments the value when plus is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<QuantitySelector value={1} max={10} onChange={onChange} />);

    await user.click(
      screen.getByRole('button', { name: messages.product.increaseQuantity }),
    );

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('coerces string values before incrementing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <QuantitySelector value={'3' as unknown as number} max={10} onChange={onChange} />,
    );

    await user.click(
      screen.getByRole('button', { name: messages.product.increaseQuantity }),
    );

    expect(onChange).toHaveBeenCalledWith(4);
  });
});