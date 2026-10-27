// @vitest-environment jsdom
import type { TAdminUser } from '@/types/admin';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { McpAccessCell } from './AdminUserCells';

// Resolve keys against the real English strings, so the tests read the text an admin sees.
vi.mock('next-intl', async () => {
  const { default: messages } = await import('@/locales/en.json');
  const translate = (namespace: string) => (key: string) =>
    [...namespace.split('.'), ...key.split('.')].reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
  return { useTranslations: translate };
});

const user: TAdminUser = {
  id: 'user-1',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Tran',
  role: 'MEMBER',
  isActive: true,
  mcpAccess: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/** Keeps the user in state, as the table does after a refresh, so a click changes what the cell shows. */
function ToggleHarness({ initialMcpAccess }: Readonly<{ initialMcpAccess: boolean }>) {
  const [mcpAccess, setMcpAccess] = useState(initialMcpAccess);
  return (
    <McpAccessCell
      user={{ ...user, mcpAccess }}
      isSelf={false}
      isPending={false}
      onToggleMcpAccess={() => setMcpAccess(current => !current)}
    />
  );
}

describe('mcp access cell', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows On and offers Turn off MCP for a user who has access', () => {
    render(<McpAccessCell user={{ ...user, mcpAccess: true }} isSelf={false} isPending={false} onToggleMcpAccess={vi.fn()} />);

    expect(screen.getByText('On')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Turn off MCP' })).toBeTruthy();
  });

  it('shows Off and offers Turn on MCP for a user without access', () => {
    render(<McpAccessCell user={user} isSelf={false} isPending={false} onToggleMcpAccess={vi.fn()} />);

    expect(screen.getByText('Off')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Turn on MCP' })).toBeTruthy();
  });

  it('calls the handler once when the button is clicked', () => {
    const onToggleMcpAccess = vi.fn();
    render(<McpAccessCell user={user} isSelf={false} isPending={false} onToggleMcpAccess={onToggleMcpAccess} />);

    fireEvent.click(screen.getByRole('button', { name: 'Turn on MCP' }));

    expect(onToggleMcpAccess).toHaveBeenCalledTimes(1);
  });

  it('toggles on and off as the user changes', () => {
    render(<ToggleHarness initialMcpAccess={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Turn on MCP' }));
    expect(screen.getByText('On')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Turn off MCP' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Turn off MCP' }));
    expect(screen.getByText('Off')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Turn on MCP' })).toBeTruthy();
  });

  it('disables the button while a change is pending, so a second click does nothing', () => {
    const onToggleMcpAccess = vi.fn();
    render(<McpAccessCell user={user} isSelf={false} isPending onToggleMcpAccess={onToggleMcpAccess} />);

    const button = screen.getByRole('button', { name: 'Turn on MCP' });
    expect(button).toHaveProperty('disabled', true);

    fireEvent.click(button);
    expect(onToggleMcpAccess).not.toHaveBeenCalled();
  });

  it('disables the button on the admin own row and says why', () => {
    render(<McpAccessCell user={user} isSelf isPending={false} onToggleMcpAccess={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Turn on MCP' })).toHaveProperty('disabled', true);
    expect(screen.getByText('You cannot change your own account here.')).toBeTruthy();
  });

  it('shows Not in plan and a disabled switch for a GUEST, even when the flag is on', () => {
    render(<McpAccessCell user={{ ...user, role: 'GUEST', mcpAccess: true }} isSelf={false} isPending={false} onToggleMcpAccess={vi.fn()} />);

    expect(screen.getByText('Not in plan')).toBeTruthy();
    expect(screen.queryByText('On')).toBeNull();
    expect(screen.getByRole('button', { name: 'Turn off MCP' })).toHaveProperty('disabled', true);
  });

  it('explains a GUEST row and never calls the handler', () => {
    const onToggleMcpAccess = vi.fn();
    render(<McpAccessCell user={{ ...user, role: 'GUEST' }} isSelf={false} isPending={false} onToggleMcpAccess={onToggleMcpAccess} />);

    expect(screen.getByText('The Free plan does not include MCP. Upgrade the user to a paid plan to allow it.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Turn on MCP' }));
    expect(onToggleMcpAccess).not.toHaveBeenCalled();
  });
});
