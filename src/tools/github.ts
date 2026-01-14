import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { GitHubAdapter } from '../platforms/github.js';

export function registerGitHubTools(server: McpServer, github: GitHubAdapter) {
  server.registerTool(
    'github_list_prs',
    {
      description: 'List pull requests for a given GitHub repository',
      inputSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
        status: z.string().optional().describe('Filter by state: opened, closed, merged, all').default('opened'),
      },
    },
    async ({ repoId, status }) => {
      const prs = await github.listMergeRequests(repoId, status);
      return { content: [{ type: 'text', text: JSON.stringify(prs, null, 2) }] };
    }
  );

  server.registerTool(
    'github_get_pr_details',
    {
      description: 'Get details of a specific pull request',
      inputSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
        prId: z.string().describe('Pull Request number'),
      },
    },
    async ({ repoId, prId }) => {
      const pr = await github.getMergeRequestDetails(repoId, prId);
      return { content: [{ type: 'text', text: JSON.stringify(pr, null, 2) }] };
    }
  );

  server.registerTool(
    'github_get_pr_diff',
    {
      description: 'Get the diff of a specific pull request',
      inputSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
        prId: z.string().describe('Pull Request number'),
      },
    },
    async ({ repoId, prId }) => {
      const diffs = await github.getMergeRequestDiff(repoId, prId);
      return { content: [{ type: 'text', text: JSON.stringify(diffs, null, 2) }] };
    }
  );

  server.registerTool(
    'github_read_file',
    {
      description: 'Read the content of a file at a specific ref',
      inputSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
        filePath: z.string().describe('Path to the file'),
        ref: z.string().optional().describe('Commit SHA, branch, or tag name').default('main'),
      },
    },
    async ({ repoId, filePath, ref }) => {
      const content = await github.readFileContent(repoId, filePath, ref);
      return { content: [{ type: 'text', text: content }] };
    }
  );

  server.registerTool(
    'github_get_project_metadata',
    {
      description: 'Fetch project metadata (README and manifests)',
      inputSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
      },
    },
    async ({ repoId }) => {
      const metadata = await github.getProjectMetadata(repoId);
      return { content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }] };
    }
  );
}
