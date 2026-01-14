#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GitLabAdapter } from './platforms/gitlab.js';
import { registerGitLabTools } from './tools/gitlab.js';
import { registerReviewPrompts } from './prompts/review.js';

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

// Register Tools and Prompts
registerGitLabTools(server, gitlab);
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
