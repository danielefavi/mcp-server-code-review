import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerGitLabTools } from '../tools/gitlab.js';
import { registerGitHubTools } from '../tools/github.js';

describe('Tool Registration', () => {
  let mockServer: any;
  let mockGitLabAdapter: any;
  let mockGitHubAdapter: any;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn(),
    };
    mockGitLabAdapter = {
      listMergeRequests: vi.fn().mockResolvedValue([]),
      getMergeRequestDetails: vi.fn().mockResolvedValue({}),
      getMergeRequestDiff: vi.fn().mockResolvedValue([]),
      readFileContent: vi.fn().mockResolvedValue('content'),
      getProjectMetadata: vi.fn().mockResolvedValue({}),
    };
    mockGitHubAdapter = {
      listMergeRequests: vi.fn().mockResolvedValue([]),
      getMergeRequestDetails: vi.fn().mockResolvedValue({}),
      getMergeRequestDiff: vi.fn().mockResolvedValue([]),
      readFileContent: vi.fn().mockResolvedValue('content'),
      getProjectMetadata: vi.fn().mockResolvedValue({}),
    };
  });

  it('should register all GitLab tools', async () => {
    registerGitLabTools(mockServer, mockGitLabAdapter);

    expect(mockServer.registerTool).toHaveBeenCalledTimes(5);

    // Test one tool handler to ensure it calls the adapter
    const [name, config, handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'gitlab_list_mrs'
    );
    expect(name).toBe('gitlab_list_mrs');

    const result = await handler({ repoId: '123', status: 'opened' });
    expect(mockGitLabAdapter.listMergeRequests).toHaveBeenCalledWith('123', 'opened');
    expect(result.content[0].text).toBe('[]');
  });

  it('should register all GitHub tools', async () => {
    registerGitHubTools(mockServer, mockGitHubAdapter);

    expect(mockServer.registerTool).toHaveBeenCalledTimes(5);

    // Test one tool handler to ensure it calls the adapter
    const [name, config, handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'github_list_prs'
    );
    expect(name).toBe('github_list_prs');

    const result = await handler({ repoId: 'owner/repo', status: 'opened' });
    expect(mockGitHubAdapter.listMergeRequests).toHaveBeenCalledWith('owner/repo', 'opened');
    expect(result.content[0].text).toBe('[]');
  });

  it('should handle gitlab_get_mr_details correctly', async () => {
    registerGitLabTools(mockServer, mockGitLabAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'gitlab_get_mr_details'
    );

    await handler({ repoId: '123', mrId: '1' });
    expect(mockGitLabAdapter.getMergeRequestDetails).toHaveBeenCalledWith('123', '1');
  });

  it('should handle gitlab_get_mr_diff correctly', async () => {
    registerGitLabTools(mockServer, mockGitLabAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'gitlab_get_mr_diff'
    );

    await handler({ repoId: '123', mrId: '1' });
    expect(mockGitLabAdapter.getMergeRequestDiff).toHaveBeenCalledWith('123', '1');
  });

  it('should handle gitlab_read_file correctly', async () => {
    registerGitLabTools(mockServer, mockGitLabAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'gitlab_read_file'
    );

    await handler({ repoId: '123', filePath: 'README.md', ref: 'main' });
    expect(mockGitLabAdapter.readFileContent).toHaveBeenCalledWith('123', 'README.md', 'main');
  });

  it('should handle gitlab_get_project_metadata correctly', async () => {
    registerGitLabTools(mockServer, mockGitLabAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'gitlab_get_project_metadata'
    );

    await handler({ repoId: '123' });
    expect(mockGitLabAdapter.getProjectMetadata).toHaveBeenCalledWith('123');
  });

  it('should handle github_get_pr_details correctly', async () => {
    registerGitHubTools(mockServer, mockGitHubAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'github_get_pr_details'
    );

    await handler({ repoId: 'owner/repo', prId: '1' });
    expect(mockGitHubAdapter.getMergeRequestDetails).toHaveBeenCalledWith('owner/repo', '1');
  });

  it('should handle github_get_pr_diff correctly', async () => {
    registerGitHubTools(mockServer, mockGitHubAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'github_get_pr_diff'
    );

    await handler({ repoId: 'owner/repo', prId: '1' });
    expect(mockGitHubAdapter.getMergeRequestDiff).toHaveBeenCalledWith('owner/repo', '1');
  });

  it('should handle github_read_file correctly', async () => {
    registerGitHubTools(mockServer, mockGitHubAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'github_read_file'
    );

    await handler({ repoId: 'owner/repo', filePath: 'README.md', ref: 'main' });
    expect(mockGitHubAdapter.readFileContent).toHaveBeenCalledWith(
      'owner/repo',
      'README.md',
      'main'
    );
  });

  it('should handle github_get_project_metadata correctly', async () => {
    registerGitHubTools(mockServer, mockGitHubAdapter);
    const [, , handler] = mockServer.registerTool.mock.calls.find(
      (call: any) => call[0] === 'github_get_project_metadata'
    );

    await handler({ repoId: 'owner/repo' });
    expect(mockGitHubAdapter.getProjectMetadata).toHaveBeenCalledWith('owner/repo');
  });
});
