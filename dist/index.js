"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const gitlab_js_1 = require("./platforms/gitlab.js");
dotenv_1.default.config();
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
if (!GITLAB_TOKEN) {
    console.error('GITLAB_TOKEN environment variable is required');
    process.exit(1);
}
const gitlab = new gitlab_js_1.GitLabAdapter(GITLAB_TOKEN, GITLAB_URL);
const server = new index_js_1.Server({
    name: 'code-review-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
        prompts: {},
    },
});
// Define Tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'gitlab_list_mrs',
                description: 'List merge requests for a given GitLab project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: { type: 'string', description: 'Project ID or URL-encoded path' },
                        status: { type: 'string', description: 'Filter by state: opened, closed, merged', default: 'opened' },
                    },
                    required: ['repoId'],
                },
            },
            {
                name: 'gitlab_get_mr_details',
                description: 'Get details of a specific merge request',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: { type: 'string', description: 'Project ID or URL-encoded path' },
                        mrId: { type: 'string', description: 'Internal ID of the merge request' },
                    },
                    required: ['repoId', 'mrId'],
                },
            },
            {
                name: 'gitlab_get_mr_diff',
                description: 'Get the diff of a specific merge request',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: { type: 'string', description: 'Project ID or URL-encoded path' },
                        mrId: { type: 'string', description: 'Internal ID of the merge request' },
                    },
                    required: ['repoId', 'mrId'],
                },
            },
            {
                name: 'gitlab_read_file',
                description: 'Read the content of a file at a specific ref',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: { type: 'string', description: 'Project ID or URL-encoded path' },
                        filePath: { type: 'string', description: 'Path to the file' },
                        ref: { type: 'string', description: 'Commit SHA, branch, or tag name', default: 'main' },
                    },
                    required: ['repoId', 'filePath'],
                },
            },
            {
                name: 'gitlab_get_project_metadata',
                description: 'Fetch project metadata (README and manifests)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: { type: 'string', description: 'Project ID or URL-encoded path' },
                    },
                    required: ['repoId'],
                },
            },
        ],
    };
});
// Handle Tool Calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'gitlab_list_mrs': {
                const { repoId, status } = zod_1.z.object({
                    repoId: zod_1.z.string(),
                    status: zod_1.z.string().optional(),
                }).parse(args);
                const mrs = await gitlab.listMergeRequests(repoId, status);
                return { content: [{ type: 'text', text: JSON.stringify(mrs, null, 2) }] };
            }
            case 'gitlab_get_mr_details': {
                const { repoId, mrId } = zod_1.z.object({
                    repoId: zod_1.z.string(),
                    mrId: zod_1.z.string(),
                }).parse(args);
                const mr = await gitlab.getMergeRequestDetails(repoId, mrId);
                return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
            }
            case 'gitlab_get_mr_diff': {
                const { repoId, mrId } = zod_1.z.object({
                    repoId: zod_1.z.string(),
                    mrId: zod_1.z.string(),
                }).parse(args);
                const diffs = await gitlab.getMergeRequestDiff(repoId, mrId);
                return { content: [{ type: 'text', text: JSON.stringify(diffs, null, 2) }] };
            }
            case 'gitlab_read_file': {
                const { repoId, filePath, ref } = zod_1.z.object({
                    repoId: zod_1.z.string(),
                    filePath: zod_1.z.string(),
                    ref: zod_1.z.string().optional(),
                }).parse(args);
                const content = await gitlab.readFileContent(repoId, filePath, ref);
                return { content: [{ type: 'text', text: content }] };
            }
            case 'gitlab_get_project_metadata': {
                const { repoId } = zod_1.z.object({
                    repoId: zod_1.z.string(),
                }).parse(args);
                const metadata = await gitlab.getProjectMetadata(repoId);
                return { content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }] };
            }
            default:
                throw new Error(`Tool not found: ${name}`);
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: 'text', text: error.message || 'Unknown error' }],
        };
    }
});
// Define Prompts
server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: 'review_merge_request',
                description: 'Guided code review for a GitLab Merge Request',
                arguments: [
                    { name: 'repoId', description: 'Project ID or path', required: true },
                    { name: 'mrId', description: 'Merge Request ID', required: true },
                ],
            },
        ],
    };
});
// Handle Prompts
server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'review_merge_request') {
        const { repoId, mrId } = zod_1.z.object({
            repoId: zod_1.z.string(),
            mrId: zod_1.z.string(),
        }).parse(args);
        return {
            description: 'Principal Engineer Review',
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
        };
    }
    throw new Error(`Prompt not found: ${name}`);
});
// Start Server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Code Review MCP server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
