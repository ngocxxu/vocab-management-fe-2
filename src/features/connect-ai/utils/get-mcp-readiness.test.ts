import { describe, expect, it } from 'vitest';
import { getMcpReadiness } from './get-mcp-readiness';

const SERVER_URL = 'https://api.example.com/api/v1/mcp';

describe('getMcpReadiness', () => {
  it('reports everything ok for a MEMBER with MCP access and a configured server', () => {
    // Arrange
    const user = { role: 'MEMBER', mcpAccess: true };

    // Act
    const readiness = getMcpReadiness(user, SERVER_URL);

    // Assert
    expect(readiness).toEqual({ plan: 'ok', access: 'ok', server: 'ok' });
  });

  it('marks the plan as locked for a GUEST (Free plan)', () => {
    const readiness = getMcpReadiness({ role: 'GUEST', mcpAccess: true }, SERVER_URL);

    expect(readiness.plan).toBe('locked');
  });

  it('marks access as disabled when an admin switched MCP access off', () => {
    const readiness = getMcpReadiness({ role: 'MEMBER', mcpAccess: false }, SERVER_URL);

    expect(readiness.access).toBe('disabled');
    expect(readiness.plan).toBe('ok');
  });

  it('treats a missing mcpAccess field as enabled, since the flag defaults to on', () => {
    const readiness = getMcpReadiness({ role: 'MEMBER' }, SERVER_URL);

    expect(readiness.access).toBe('ok');
  });

  it('marks the server as missing when the URL is unset', () => {
    const readiness = getMcpReadiness({ role: 'MEMBER', mcpAccess: true }, undefined);

    expect(readiness.server).toBe('missing');
  });

  it('marks the server as missing when the URL is blank or only spaces', () => {
    const user = { role: 'MEMBER', mcpAccess: true };

    expect(getMcpReadiness(user, '').server).toBe('missing');
    expect(getMcpReadiness(user, '   ').server).toBe('missing');
  });

  it('reports plan and access problems independently, so the UI can pick the first one to show', () => {
    const readiness = getMcpReadiness({ role: 'GUEST', mcpAccess: false }, SERVER_URL);

    expect(readiness).toEqual({ plan: 'locked', access: 'disabled', server: 'ok' });
  });
});
