import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitLabAdapter } from '../platforms/gitlab.js';

vi.mock('@gitbeaker/rest', () => {
  return {
    Gitlab: vi.fn().mockImplementation(function() {
      return {
        MergeRequests: {
          all: vi.fn().mockResolvedValue([
            { iid: 1, title: 'Test MR', description: 'Desc', author: { username: 'user1' }, source_branch: 'src', target_branch: 'tgt', web_url: 'url' }
          ]),
          show: vi.fn().mockResolvedValue(
            { iid: 1, title: 'Test MR', description: 'Desc', author: { username: 'user1' }, source_branch: 'src', target_branch: 'tgt', web_url: 'url' }
          ),
          allDiffs: vi.fn().mockResolvedValue([
            { new_path: 'file.ts', old_path: 'file.ts', diff: '@@ .. @@', new_file: false, deleted_file: false, renamed_file: false }
          ])
        },
        RepositoryFiles: {
          show: vi.fn().mockResolvedValue({ content: Buffer.from('test content').toString('base64') })
        }
      };
    })
  };
});

describe('GitLabAdapter', () => {
  let adapter: GitLabAdapter;

  beforeEach(() => {
    adapter = new GitLabAdapter('token', 'https://gitlab.com');
  });

  it('should list merge requests', async () => {
    const mrs = await adapter.listMergeRequests('project/repo');
    expect(mrs).toHaveLength(1);
    expect(mrs[0].title).toBe('Test MR');
  });

  it('should get merge request details', async () => {
    const mr = await adapter.getMergeRequestDetails('project/repo', '1');
    expect(mr.title).toBe('Test MR');
    expect(mr.author).toBe('user1');
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
});