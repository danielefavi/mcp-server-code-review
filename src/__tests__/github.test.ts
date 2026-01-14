import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubAdapter } from '../platforms/github.js';

vi.mock('octokit', () => {
  return {
    Octokit: vi.fn().mockImplementation(function() {
      return {
        rest: {
          pulls: {
            list: vi.fn().mockResolvedValue({
              data: [
                { number: 1, title: 'Test PR', body: 'Desc', user: { login: 'user1' }, head: { ref: 'src' }, base: { ref: 'tgt' }, html_url: 'url' }
              ]
            }),
            get: vi.fn().mockResolvedValue({
              data: { number: 1, title: 'Test PR', body: 'Desc', user: { login: 'user1' }, head: { ref: 'src' }, base: { ref: 'tgt' }, html_url: 'url' }
            }),
            listFiles: vi.fn().mockResolvedValue({
              data: [
                { filename: 'file.ts', previous_filename: undefined, patch: '@@ .. @@', status: 'modified' }
              ]
            })
          },
          repos: {
            getContent: vi.fn().mockResolvedValue({
              data: { content: Buffer.from('test content').toString('base64') }
            }),
            getReadme: vi.fn().mockResolvedValue({
                data: { content: Buffer.from('readme content').toString('base64') }
            })
          }
        }
      };
    })
  };
});

describe('GitHubAdapter', () => {
  let adapter: GitHubAdapter;

  beforeEach(() => {
    adapter = new GitHubAdapter('token');
  });

  it('should list pull requests', async () => {
    const prs = await adapter.listMergeRequests('owner/repo');
    expect(prs).toHaveLength(1);
    expect(prs[0].title).toBe('Test PR');
  });

  it('should get pull request details', async () => {
    const pr = await adapter.getMergeRequestDetails('owner/repo', '1');
    expect(pr.title).toBe('Test PR');
    expect(pr.author).toBe('user1');
  });

  it('should get pull request diff', async () => {
    const diffs = await adapter.getMergeRequestDiff('owner/repo', '1');
    expect(diffs).toHaveLength(1);
    expect(diffs[0].newPath).toBe('file.ts');
  });

  it('should read file content', async () => {
    const content = await adapter.readFileContent('owner/repo', 'README.md');
    expect(content).toBe('test content');
  });
});
