import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { GitLabAdapter } from './platforms/gitlab.js';
dotenv.config();
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
if (!GITLAB_TOKEN) {
    console.error('GITLAB_TOKEN environment variable is required');
    process.exit(1);
}
const gitlab = new GitLabAdapter(GITLAB_TOKEN, GITLAB_URL);
const server = new McpServer({
    name: 'code-review-mcp',
    version: '1.0.0',
});
// Register Tools
server.registerTool('gitlab_list_mrs', {
    description: 'List merge requests for a given GitLab project',
    inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        status: z.string().optional().describe('Filter by state: opened, closed, merged').default('opened'),
    },
}, async ({ repoId, status }) => {
    const mrs = await gitlab.listMergeRequests(repoId, status);
    return { content: [{ type: 'text', text: JSON.stringify(mrs, null, 2) }] };
});
server.registerTool('gitlab_get_mr_details', {
    description: 'Get details of a specific merge request',
    inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        mrId: z.string().describe('Internal ID of the merge request'),
    },
}, async ({ repoId, mrId }) => {
    const mr = await gitlab.getMergeRequestDetails(repoId, mrId);
    return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
});
server.registerTool('gitlab_get_mr_diff', {
    description: 'Get the diff of a specific merge request',
    inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        mrId: z.string().describe('Internal ID of the merge request'),
    },
}, async ({ repoId, mrId }) => {
    const diffs = await gitlab.getMergeRequestDiff(repoId, mrId);
    return { content: [{ type: 'text', text: JSON.stringify(diffs, null, 2) }] };
});
server.registerTool('gitlab_read_file', {
    description: 'Read the content of a file at a specific ref',
    inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        filePath: z.string().describe('Path to the file'),
        ref: z.string().optional().describe('Commit SHA, branch, or tag name').default('main'),
    },
}, async ({ repoId, filePath, ref }) => {
    const content = await gitlab.readFileContent(repoId, filePath, ref);
    return { content: [{ type: 'text', text: content }] };
});
server.registerTool('gitlab_get_project_metadata', {
    description: 'Fetch project metadata (README and manifests)',
    inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
    },
}, async ({ repoId }) => {
    const metadata = await gitlab.getProjectMetadata(repoId);
    return { content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }] };
});
// Register Prompts
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
// Start Server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Code Review MCP server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
