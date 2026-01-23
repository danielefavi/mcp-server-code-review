import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubAdapter } from '../platforms/github.js';

// Create mock functions
const mockPullsList = vi.fn();
const mockPullsGet = vi.fn();
const mockPullsListFiles = vi.fn();
const mockReposGetContent = vi.fn();
const mockReposGetReadme = vi.fn();

vi.mock('octokit', () => {
  return {
    Octokit: vi.fn().mockImplementation(function () {
      return {
        rest: {
          pulls: {
            list: mockPullsList,
            get: mockPullsGet,
            listFiles: mockPullsListFiles,
          },
          repos: {
            getContent: mockReposGetContent,
            getReadme: mockReposGetReadme,
          },
        },
      };
    }),
  };
});

describe('GitHubAdapter', () => {
  let adapter: GitHubAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new GitHubAdapter('token');

    // Default happy path mocks
    mockPullsList.mockResolvedValue({
      data: [
        {
          number: 1,
          title: 'Test PR',
          body: 'Desc',
          user: { login: 'user1' },
          head: { ref: 'src' },
          base: { ref: 'tgt' },
          html_url: 'url',
          merged_at: null,
        },
      ],
    });
    mockPullsGet.mockResolvedValue({
      data: {
        number: 1,
        title: 'Test PR',
        body: 'Desc',
        user: { login: 'user1' },
        head: { ref: 'src' },
        base: { ref: 'tgt' },
        html_url: 'url',
      },
    });
    mockPullsListFiles.mockResolvedValue({
      data: [
        {
          filename: 'file.ts',
          previous_filename: undefined,
          patch: '@@ .. @@',
          status: 'modified',
        },
      ],
    });
    mockReposGetContent.mockResolvedValue({
      data: { content: Buffer.from('test content').toString('base64') },
    });
    mockReposGetReadme.mockResolvedValue({
      data: { content: Buffer.from('readme api content').toString('base64') },
    });
  });

  it('should parse repo ID correctly', async () => {
    await adapter.listMergeRequests('owner/repo');
    expect(mockPullsList).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'owner', repo: 'repo' })
    );
  });

  it('should throw error on invalid repo ID', async () => {
    await expect(adapter.listMergeRequests('invalid')).rejects.toThrow('Invalid repoId');
  });

  it('should list pull requests', async () => {
    const prs = await adapter.listMergeRequests('owner/repo');
    expect(prs).toHaveLength(1);
    expect(mockPullsList).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
  });

  it('should filter merged pull requests', async () => {
    mockPullsList.mockResolvedValue({
      data: [
        {
          number: 1,
          merged_at: '2023-01-01',
          title: 'Merged PR',
          body: 'Desc',
          user: { login: 'user1' },
          head: { ref: 'src' },
          base: { ref: 'tgt' },
          html_url: 'url',
        },
        {
          number: 2,
          merged_at: null,
          title: 'Closed Unmerged PR',
          body: 'Desc',
          user: { login: 'user1' },
          head: { ref: 'src' },
          base: { ref: 'tgt' },
          html_url: 'url',
        },
      ],
    });

    const prs = await adapter.listMergeRequests('owner/repo', 'merged');
    expect(mockPullsList).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
    expect(prs).toHaveLength(1);
    expect(prs[0].id).toBe('1');
  });

  it('should list closed pull requests', async () => {
    await adapter.listMergeRequests('owner/repo', 'closed');
    expect(mockPullsList).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
  });

  it('should list all pull requests', async () => {
    await adapter.listMergeRequests('owner/repo', 'all');
    expect(mockPullsList).toHaveBeenCalledWith(expect.objectContaining({ state: 'all' }));
  });

  it('should get pull request details', async () => {
    const pr = await adapter.getMergeRequestDetails('owner/repo', '1');
    expect(pr.title).toBe('Test PR');
  });

  it('should get pull request diff', async () => {
    const diffs = await adapter.getMergeRequestDiff('owner/repo', '1');
    expect(diffs).toHaveLength(1);
  });

  it('should read file content', async () => {
    const content = await adapter.readFileContent('owner/repo', 'README.md');
    expect(content).toBe('test content');
  });

  it('should throw error if file response is array (directory)', async () => {
    mockReposGetContent.mockResolvedValue({ data: [] });
    await expect(adapter.readFileContent('owner/repo', 'dir')).rejects.toThrow(
      'File not found or is a directory'
    );
  });

  it('should get project metadata via direct file access', async () => {
    // Mock direct success
    mockReposGetContent.mockImplementation(({ path }) => {
      if (path === 'README.md')
        return Promise.resolve({
          data: { content: Buffer.from('readme direct').toString('base64') },
        });
      return Promise.reject(new Error('Not found'));
    });

    const metadata = await adapter.getProjectMetadata('owner/repo');
    expect(metadata.readme).toBe('readme direct');
  });

  it('should get project metadata via fallback API', async () => {
    // Mock direct fail
    mockReposGetContent.mockRejectedValue(new Error('Not found'));
    // Mock API success (set in beforeEach)

    const metadata = await adapter.getProjectMetadata('owner/repo');
    expect(metadata.readme).toBe('readme api content');
  });

  it('should continue to next manifest if first fails', async () => {
    mockReposGetContent.mockImplementation(({ path }) => {
      if (path === 'README.md')
        return Promise.resolve({ data: { content: Buffer.from('readme').toString('base64') } });
      if (path === 'package.json') return Promise.reject(new Error('Not found'));
      if (path === 'go.mod')
        return Promise.resolve({ data: { content: Buffer.from('go module').toString('base64') } });
      return Promise.reject(new Error('Not found'));
    });

    const metadata = await adapter.getProjectMetadata('owner/repo');
    expect(metadata.manifest).toBe('go module');
  });

  it('should handle missing metadata gracefully', async () => {
    mockReposGetContent.mockRejectedValue(new Error('Not found'));
    mockReposGetReadme.mockRejectedValue(new Error('Not found'));

    const metadata = await adapter.getProjectMetadata('owner/repo');
    expect(metadata.readme).toBeUndefined();
    expect(metadata.manifest).toBeUndefined();
  });
});
