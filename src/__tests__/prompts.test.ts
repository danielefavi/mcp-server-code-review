import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerReviewPrompts } from '../prompts/review.js';

describe('Prompt Registration', () => {
  let mockServer: any;

  beforeEach(() => {
    mockServer = {
      registerPrompt: vi.fn(),
    };
  });

  it('should register review_merge_request prompt', () => {
    registerReviewPrompts(mockServer);

    expect(mockServer.registerPrompt).toHaveBeenCalledWith(
      'review_merge_request',
      expect.anything(),
      expect.any(Function)
    );

    const handler = mockServer.registerPrompt.mock.calls.find(
      (call: any) => call[0] === 'review_merge_request'
    )[2];
    const result = handler({ repoId: 'my-project', mrId: '123' });
    expect(result.messages[0].content.text).toContain('review GitLab Merge Request 123');
  });

  it('should register review_pull_request prompt', () => {
    registerReviewPrompts(mockServer);

    expect(mockServer.registerPrompt).toHaveBeenCalledWith(
      'review_pull_request',
      expect.anything(),
      expect.any(Function)
    );

    const handler = mockServer.registerPrompt.mock.calls.find(
      (call: any) => call[0] === 'review_pull_request'
    )[2];
    const result = handler({ repoId: 'owner/repo', prId: '456' });
    expect(result.messages[0].content.text).toContain('review GitHub Pull Request 456');
    expect(result.messages[0].content.text).toContain('github_get_pr_details');
  });
});
