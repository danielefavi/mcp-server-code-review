import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformFactory } from '../platforms/factory.js';
import { GitLabAdapter } from '../platforms/gitlab.js';
import { GitHubAdapter } from '../platforms/github.js';

// Mock the adapter classes
vi.mock('../platforms/gitlab.js', () => ({
  GitLabAdapter: vi.fn()
}));

vi.mock('../platforms/github.js', () => ({
  GitHubAdapter: vi.fn()
}));

describe('PlatformFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create GitLab adapter explicitly', () => {
    PlatformFactory.createGitLab('gl-token', 'https://custom.gitlab.com');
    expect(GitLabAdapter).toHaveBeenCalledWith('gl-token', 'https://custom.gitlab.com');
  });

  it('should create GitHub adapter explicitly', () => {
    PlatformFactory.createGitHub('gh-token');
    expect(GitHubAdapter).toHaveBeenCalledWith('gh-token');
  });

  it('should initialize GitLab from environment', () => {
    process.env.GITLAB_TOKEN = 'env-gl-token';
    process.env.GITLAB_URL = 'https://env.gitlab.com';
    delete process.env.GITHUB_TOKEN;

    const adapters = PlatformFactory.initializeFromEnv();

    expect(adapters.gitlab).toBeDefined();
    expect(adapters.github).toBeUndefined();
    expect(GitLabAdapter).toHaveBeenCalledWith('env-gl-token', 'https://env.gitlab.com');
    expect(GitHubAdapter).not.toHaveBeenCalled();
  });

  it('should initialize GitHub from environment', () => {
    process.env.GITHUB_TOKEN = 'env-gh-token';
    delete process.env.GITLAB_TOKEN;

    const adapters = PlatformFactory.initializeFromEnv();

    expect(adapters.github).toBeDefined();
    expect(adapters.gitlab).toBeUndefined();
    expect(GitHubAdapter).toHaveBeenCalledWith('env-gh-token');
    expect(GitLabAdapter).not.toHaveBeenCalled();
  });

  it('should initialize both from environment', () => {
    process.env.GITLAB_TOKEN = 'env-gl-token';
    process.env.GITHUB_TOKEN = 'env-gh-token';

    const adapters = PlatformFactory.initializeFromEnv();

    expect(adapters.gitlab).toBeDefined();
    expect(adapters.github).toBeDefined();
    expect(GitLabAdapter).toHaveBeenCalledWith('env-gl-token', undefined);
    expect(GitHubAdapter).toHaveBeenCalledWith('env-gh-token');
  });

  it('should return empty object if no tokens are set', () => {
    delete process.env.GITLAB_TOKEN;
    delete process.env.GITHUB_TOKEN;

    const adapters = PlatformFactory.initializeFromEnv();

    expect(adapters.gitlab).toBeUndefined();
    expect(adapters.github).toBeUndefined();
  });
});
