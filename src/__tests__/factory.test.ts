import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformFactory } from '../platforms/factory.js';
import { GitLabAdapter } from '../platforms/gitlab.js';
import { GitHubAdapter } from '../platforms/github.js';
import { readFileSync } from 'fs';

// Mock the adapter classes
vi.mock('../platforms/gitlab.js', () => ({
  GitLabAdapter: vi.fn(),
}));

vi.mock('../platforms/github.js', () => ({
  GitHubAdapter: vi.fn(),
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
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

  describe('loadCodeReviewGuidelines', () => {
    beforeEach(() => {
      delete process.env.CODE_REVIEW_GUIDELINES_FILE;
      delete process.env.CODE_REVIEW_GUIDELINES;
    });

    it('should return undefined when no guidelines are configured', () => {
      const result = PlatformFactory.loadCodeReviewGuidelines();
      expect(result).toBeUndefined();
    });

    it('should return guidelines from CODE_REVIEW_GUIDELINES env var', () => {
      process.env.CODE_REVIEW_GUIDELINES = 'Custom guidelines text';

      const result = PlatformFactory.loadCodeReviewGuidelines();

      expect(result).toBe('Custom guidelines text');
    });

    it('should read guidelines from file when CODE_REVIEW_GUIDELINES_FILE is set', () => {
      process.env.CODE_REVIEW_GUIDELINES_FILE = '/path/to/guidelines.txt';
      vi.mocked(readFileSync).mockReturnValue('Guidelines from file');

      const result = PlatformFactory.loadCodeReviewGuidelines();

      expect(readFileSync).toHaveBeenCalledWith('/path/to/guidelines.txt', 'utf-8');
      expect(result).toBe('Guidelines from file');
    });

    it('should prefer file over direct text when both are set', () => {
      process.env.CODE_REVIEW_GUIDELINES_FILE = '/path/to/guidelines.txt';
      process.env.CODE_REVIEW_GUIDELINES = 'Direct text';
      vi.mocked(readFileSync).mockReturnValue('Guidelines from file');

      const result = PlatformFactory.loadCodeReviewGuidelines();

      expect(result).toBe('Guidelines from file');
    });

    it('should fall back to direct text when file read fails', () => {
      process.env.CODE_REVIEW_GUIDELINES_FILE = '/invalid/path.txt';
      process.env.CODE_REVIEW_GUIDELINES = 'Fallback text';
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = PlatformFactory.loadCodeReviewGuidelines();

      expect(result).toBe('Fallback text');
    });

    it('should return undefined when file read fails and no fallback text', () => {
      process.env.CODE_REVIEW_GUIDELINES_FILE = '/invalid/path.txt';
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = PlatformFactory.loadCodeReviewGuidelines();

      expect(result).toBeUndefined();
    });
  });
});
