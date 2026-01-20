import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('ProductManager', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:5005';
  });

  it('renders and fetches products', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 1,
              name: 'Widget',
              comment: 'ok',
              quantity: 2,
              company_id: '1',
              company: { name: 'Acme' },
            },
          ],
        }),
    });
    // @ts-expect-error fetch mock
    global.fetch = fetchMock;

    const { default: ProductManager } = await import('./ProductManager');
    render(<ProductManager />);

    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByText(/Widget/)).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    const row = screen.getByText(/Widget/).closest('li');
    expect(row).not.toBeNull();
    expect(row as HTMLElement).toHaveTextContent('Widget - ok (2) from Acme (1)');
  });

  it('creates a product and renders the new row', async () => {
    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (!options || options.method === 'GET') {
        return Promise.resolve({
          json: () => Promise.resolve({ data: [] }),
        });
      }

      if (options.method === 'POST') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              id: 2,
              name: 'Gadget',
              comment: 'new',
              quantity: 4,
              company_id: '1',
              company: { name: 'Acme' },
            }),
        });
      }

      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    // @ts-expect-error fetch mock
    global.fetch = fetchMock;

    const { default: ProductManager } = await import('./ProductManager');
    render(<ProductManager />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Product name'), 'Gadget');
    await user.type(screen.getByPlaceholderText('Comment'), 'new');
    await user.clear(screen.getByPlaceholderText('Quantity'));
    await user.type(screen.getByPlaceholderText('Quantity'), '4');
    await user.type(screen.getByPlaceholderText('Company id'), '1');
    await user.click(screen.getByText('Add Product'));

    expect(await screen.findByText(/Gadget/)).toBeInTheDocument();
  });

  it('updates an existing product', async () => {
    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (!options || options.method === 'GET') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  name: 'Widget',
                  comment: 'ok',
                  quantity: 2,
                  company_id: '1',
                  company: { name: 'Acme' },
                },
              ],
            }),
        });
      }

      if (options.method === 'PUT') {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      }

      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    // @ts-expect-error fetch mock
    global.fetch = fetchMock;

    const { default: ProductManager } = await import('./ProductManager');
    render(<ProductManager />);

    const user = userEvent.setup();
    await screen.findByText(/Widget/);
    await user.click(screen.getByText('Edit'));

    const nameInput = screen.getAllByPlaceholderText('Product name')[1];
    await user.clear(nameInput);
    await user.type(nameInput, 'Widget Pro');
    await user.click(screen.getByText('Update Product'));

    expect(await screen.findByText(/Widget Pro/)).toBeInTheDocument();
  });

  it('deletes a product', async () => {
    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (!options || options.method === 'GET') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 1,
                  name: 'Widget',
                  comment: 'ok',
                  quantity: 2,
                  company_id: '1',
                  company: { name: 'Acme' },
                },
              ],
            }),
        });
      }

      if (options.method === 'DELETE') {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      }

      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    // @ts-expect-error fetch mock
    global.fetch = fetchMock;

    const { default: ProductManager } = await import('./ProductManager');
    render(<ProductManager />);

    const user = userEvent.setup();
    await screen.findByText(/Widget/);
    await user.click(screen.getByText('Delete'));

    await waitFor(() => expect(screen.queryByText(/Widget/)).toBeNull());
  });

  it('shows validation errors when fields are missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
    });
    // @ts-expect-error fetch mock
    global.fetch = fetchMock;

    const { default: ProductManager } = await import('./ProductManager');
    render(<ProductManager />);

    const user = userEvent.setup();
    await user.click(screen.getByText('Add Product'));

    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
  });
});
