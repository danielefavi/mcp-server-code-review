#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GitLabAdapter } from './platforms/gitlab.js';
import { GitHubAdapter } from './platforms/github.js';
import { registerGitLabTools } from './tools/gitlab.js';
import { registerGitHubTools } from './tools/github.js';
import { registerReviewPrompts } from './prompts/review.js';

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITLAB_TOKEN && !GITHUB_TOKEN) {
  console.error('Error: At least one of GITLAB_TOKEN or GITHUB_TOKEN must be set.');
  process.exit(1);
}

const server = new McpServer({
  name: 'code-review-mcp',
  version: '1.0.0',
});

// Register GitLab Tools
if (GITLAB_TOKEN) {
  try {
    const gitlab = new GitLabAdapter(GITLAB_TOKEN, GITLAB_URL);
    registerGitLabTools(server, gitlab);
    console.error('GitLab integration enabled.');
  } catch (err) {
    console.error('Failed to initialize GitLab adapter:', err);
  }
}

// Register GitHub Tools
if (GITHUB_TOKEN) {
  try {
    const github = new GitHubAdapter(GITHUB_TOKEN);
    registerGitHubTools(server, github);
    console.error('GitHub integration enabled.');
  } catch (err) {
    console.error('Failed to initialize GitHub adapter:', err);
  }
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
