import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { GitLabAdapter } from '../platforms/gitlab.js';

/**
 * Registers GitLab-specific tools with the MCP server.
 * 
 * Registered tools:
 * - gitlab_list_mrs: List merge requests.
 * - gitlab_get_mr_details: Get details of a specific MR.
 * - gitlab_get_mr_diff: Get file changes for an MR.
 * - gitlab_read_file: Read a file from the repository.
 * - gitlab_get_project_metadata: Fetch README and manifest.
 * 
 * @param server The MCP server instance.
 * @param gitlab The initialized GitLab adapter.
 */
export function registerGitLabTools(server: McpServer, gitlab: GitLabAdapter) {
  server.registerTool(
    'gitlab_list_mrs',
    {
      description: 'List merge requests for a given GitLab project',
      inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        status: z.string().optional().describe('Filter by state: opened, closed, merged').default('opened'),
      },
    },
    async ({ repoId, status }) => {
      const mrs = await gitlab.listMergeRequests(repoId, status);
      return { content: [{ type: 'text', text: JSON.stringify(mrs, null, 2) }] };
    }
  );

  server.registerTool(
    'gitlab_get_mr_details',
    {
      description: 'Get details of a specific merge request',
      inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        mrId: z.string().describe('Internal ID of the merge request'),
      },
    },
    async ({ repoId, mrId }) => {
      const mr = await gitlab.getMergeRequestDetails(repoId, mrId);
      return { content: [{ type: 'text', text: JSON.stringify(mr, null, 2) }] };
    }
  );

  server.registerTool(
    'gitlab_get_mr_diff',
    {
      description: 'Get the diff of a specific merge request',
      inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        mrId: z.string().describe('Internal ID of the merge request'),
      },
    },
    async ({ repoId, mrId }) => {
      const diffs = await gitlab.getMergeRequestDiff(repoId, mrId);
      return { content: [{ type: 'text', text: JSON.stringify(diffs, null, 2) }] };
    }
  );

  server.registerTool(
    'gitlab_read_file',
    {
      description: 'Read the content of a file at a specific ref',
      inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
        filePath: z.string().describe('Path to the file'),
        ref: z.string().optional().describe('Commit SHA, branch, or tag name').default('main'),
      },
    },
    async ({ repoId, filePath, ref }) => {
      const content = await gitlab.readFileContent(repoId, filePath, ref);
      return { content: [{ type: 'text', text: content }] };
    }
  );

  server.registerTool(
    'gitlab_get_project_metadata',
    {
      description: 'Fetch project metadata (README and manifests)',
      inputSchema: {
        repoId: z.string().describe('Project ID or URL-encoded path'),
      },
    },
    async ({ repoId }) => {
      const metadata = await gitlab.getProjectMetadata(repoId);
      return { content: [{ type: 'text', text: JSON.stringify(metadata, null, 2) }] };
    }
  );
}
