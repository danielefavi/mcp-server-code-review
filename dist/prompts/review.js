import { z } from 'zod';
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
}
