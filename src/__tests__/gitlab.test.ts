import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitLabAdapter } from '../platforms/gitlab.js';

// Create mock functions that we can manipulate in tests
const mockMergeRequestsAll = vi.fn();
const mockMergeRequestsShow = vi.fn();
const mockMergeRequestsAllDiffs = vi.fn();
const mockRepositoryFilesShow = vi.fn();

vi.mock('@gitbeaker/rest', () => {
  return {
    Gitlab: vi.fn().mockImplementation(function () {
      return {
        MergeRequests: {
          all: mockMergeRequestsAll,
          show: mockMergeRequestsShow,
          allDiffs: mockMergeRequestsAllDiffs,
        },
        RepositoryFiles: {
          show: mockRepositoryFilesShow,
        },
      };
    }),
  };
});

describe('GitLabAdapter', () => {
  let adapter: GitLabAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new GitLabAdapter('token', 'https://gitlab.com');

    // Default happy path mocks
    mockMergeRequestsAll.mockResolvedValue([
      {
        iid: 1,
        title: 'Test MR',
        description: 'Desc',
        author: { username: 'user1' },
        source_branch: 'src',
        target_branch: 'tgt',
        web_url: 'url',
      },
    ]);
    mockMergeRequestsShow.mockResolvedValue({
      iid: 1,
      title: 'Test MR',
      description: 'Desc',
      author: { username: 'user1' },
      source_branch: 'src',
      target_branch: 'tgt',
      web_url: 'url',
    });
    mockMergeRequestsAllDiffs.mockResolvedValue([
      {
        new_path: 'file.ts',
        old_path: 'file.ts',
        diff: '@@ .. @@',
        new_file: false,
        deleted_file: false,
        renamed_file: false,
      },
    ]);
    mockRepositoryFilesShow.mockResolvedValue({
      content: Buffer.from('test content').toString('base64'),
    });
  });

  it('should list merge requests', async () => {
    const mrs = await adapter.listMergeRequests('project/repo');
    expect(mrs).toHaveLength(1);
    expect(mrs[0].title).toBe('Test MR');
    expect(mockMergeRequestsAll).toHaveBeenCalledWith({
      projectId: 'project/repo',
      state: 'opened',
    });
  });

  it('should list merged merge requests', async () => {
    await adapter.listMergeRequests('project/repo', 'merged');
    expect(mockMergeRequestsAll).toHaveBeenCalledWith({
      projectId: 'project/repo',
      state: 'merged',
    });
  });

  it('should get merge request details', async () => {
    const mr = await adapter.getMergeRequestDetails('project/repo', '1');
    expect(mr.title).toBe('Test MR');
    expect(mr.author).toBe('user1');
  });

  it('should throw error if merge request not found', async () => {
    mockMergeRequestsShow.mockRejectedValue(new Error('404 Not Found'));
    await expect(adapter.getMergeRequestDetails('project/repo', '999')).rejects.toThrow(
      '404 Not Found'
    );
  });

  it('should get merge request diff', async () => {
    const diffs = await adapter.getMergeRequestDiff('project/repo', '1');
    expect(diffs).toHaveLength(1);
    expect(diffs[0].newPath).toBe('file.ts');
  });

  it('should read file content', async () => {
    const content = await adapter.readFileContent('project/repo', 'README.md');
    expect(content).toBe('test content');
  });

  it('should throw error if file not found', async () => {
    mockRepositoryFilesShow.mockRejectedValue(new Error('404 File Not Found'));
    await expect(adapter.readFileContent('project/repo', 'MISSING.md')).rejects.toThrow(
      '404 File Not Found'
    );
  });

  it('should get project metadata with readme and manifest', async () => {
    // Mock README success
    mockRepositoryFilesShow.mockImplementation((repoId, filePath) => {
      if (filePath === 'README.md')
        return Promise.resolve({ content: Buffer.from('readme content').toString('base64') });
      if (filePath === 'package.json')
        return Promise.resolve({ content: Buffer.from('manifest content').toString('base64') });
      return Promise.reject(new Error('Not found'));
    });

    const metadata = await adapter.getProjectMetadata('project/repo');
    expect(metadata.readme).toBe('readme content');
    expect(metadata.manifest).toBe('manifest content');
  });

  it('should continue to next manifest if first fails', async () => {
    mockRepositoryFilesShow.mockImplementation((repoId, filePath) => {
      if (filePath === 'README.md')
        return Promise.resolve({ content: Buffer.from('readme').toString('base64') });

      if (filePath === 'package.json') return Promise.reject(new Error('Not found'));

      if (filePath === 'go.mod')
        return Promise.resolve({ content: Buffer.from('go module').toString('base64') });

      return Promise.reject(new Error('Not found'));
    });

    const metadata = await adapter.getProjectMetadata('project/repo');

    expect(metadata.manifest).toBe('go module');
  });
});
