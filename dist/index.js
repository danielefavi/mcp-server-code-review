#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PlatformFactory } from './platforms/factory.js';
import { registerGitLabTools } from './tools/gitlab.js';
import { registerGitHubTools } from './tools/github.js';
import { registerReviewPrompts } from './prompts/review.js';
const adapters = PlatformFactory.initializeFromEnv();
if (!adapters.gitlab && !adapters.github) {
    console.error('Error: At least one of GITLAB_TOKEN or GITHUB_TOKEN must be set.');
    process.exit(1);
}
const server = new McpServer({
    name: 'code-review-mcp',
    version: '1.0.0',
});
// Register GitLab Tools
if (adapters.gitlab) {
    registerGitLabTools(server, adapters.gitlab);
    console.error('GitLab integration enabled.');
}
// Register GitHub Tools
if (adapters.github) {
    registerGitHubTools(server, adapters.github);
    console.error('GitHub integration enabled.');
}
registerReviewPrompts(server);
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
