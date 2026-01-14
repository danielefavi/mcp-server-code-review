import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
export declare function registerGitLabTools(server: McpServer, gitlab: GitLabAdapter): void;
