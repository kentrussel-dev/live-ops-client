import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';

describe('Auth Store & Role Permissions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with no authenticated user', () => {
    const auth = useAuthStore();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.role).toBe('readonly_viewer');
    expect(auth.canEdit).toBe(false);
  });

  it('should grant edit permissions when logged in as liveops_editor', () => {
    const auth = useAuthStore();
    auth.setAuth('mock-token-xyz', {
      _id: 'usr-1',
      username: 'ops_lead',
      email: 'editor@liveops.aetheria.gg',
      role: 'liveops_editor',
      department: 'Live Operations',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.role).toBe('liveops_editor');
    expect(auth.canEdit).toBe(true);
    expect(auth.isViewerOnly).toBe(false);
  });

  it('should enforce read-only status for readonly_viewer role', () => {
    const auth = useAuthStore();
    auth.setAuth('mock-token-abc', {
      _id: 'usr-2',
      username: 'qa_auditor',
      email: 'viewer@qa.aetheria.gg',
      role: 'readonly_viewer',
      department: 'Quality Assurance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.role).toBe('readonly_viewer');
    expect(auth.canEdit).toBe(false);
    expect(auth.isViewerOnly).toBe(true);
  });

  it('should clear token and user state on logout', () => {
    const auth = useAuthStore();
    auth.setAuth('mock-token', {
      _id: '1',
      username: 'test',
      email: 'test@aetheria.gg',
      role: 'admin',
      department: 'Dev',
      createdAt: '',
      updatedAt: '',
    });

    expect(auth.isAuthenticated).toBe(true);
    auth.logout();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
  });
});
