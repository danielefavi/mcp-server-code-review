import { z } from 'zod';
/**
 * Registers prompt templates for code reviews with the MCP server.
 *
 * Registered prompts:
 * - review_merge_request: A guided prompt for reviewing GitLab merge requests.
 * - review_pull_request: A guided prompt for reviewing GitHub pull requests.
 *
 * @param server The MCP server instance.
 */
export function registerReviewPrompts(server) {
    server.registerPrompt('review_merge_request', {
        description: 'Guided code review for a GitLab Merge Request',
        argsSchema: {
            repoId: z.string().describe('Project ID or path'),
            mrId: z.string().describe('Merge Request ID'),
        },
    }, ({ repoId, mrId }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are a Principal Software Engineer. Your goal is to review GitLab Merge Request ${mrId} in project ${repoId}.

Please follow these steps:
1. Call gitlab_get_project_metadata to understand the tech stack and guidelines.
2. Call gitlab_get_mr_details to understand the intent of the changes.
3. MANDATORY: Ask the user to provide detailed requirements or description from the associated issue/ticket (e.g., Jira, Linear) if they haven't already.
4. Call gitlab_get_mr_diff to analyze the code changes.

Review Guidelines:
- Focus on logic errors, race conditions, security, and architectural alignment.
- Suggest idiomatic improvements.
- Verify the changes against the user-provided requirements.

Provide your feedback structured as: Summary, Critical Issues, Suggestions, and Nitpicks.`,
                },
            },
        ],
    }));
    server.registerPrompt('review_pull_request', {
        description: 'Guided code review for a GitHub Pull Request',
        argsSchema: {
            repoId: z.string().describe('Repository name in format owner/repo'),
            prId: z.string().describe('Pull Request number'),
        },
    }, ({ repoId, prId }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are a Principal Software Engineer. Your goal is to review GitHub Pull Request ${prId} in repository ${repoId}.

Please follow these steps:
1. Call github_get_project_metadata to understand the tech stack and guidelines.
2. Call github_get_pr_details to understand the intent of the changes.
3. MANDATORY: Ask the user to provide detailed requirements or description from the associated issue/ticket (e.g., Jira, Linear) if they haven't already.
4. Call github_get_pr_diff to analyze the code changes.

Review Guidelines:
- Focus on logic errors, race conditions, security, and architectural alignment.
- Suggest idiomatic improvements.
- Verify the changes against the user-provided requirements.

Provide your feedback structured as: Summary, Critical Issues, Suggestions, and Nitpicks.`,
                },
            },
        ],
    }));
}
