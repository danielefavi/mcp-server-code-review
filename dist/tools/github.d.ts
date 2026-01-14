import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GitHubAdapter } from '../platforms/github.js';
/**
 * Registers GitHub-specific tools with the MCP server.
 *
 * Registered tools:
 * - github_list_prs: List pull requests.
 * - github_get_pr_details: Get details of a specific PR.
 * - github_get_pr_diff: Get file changes for a PR.
 * - github_read_file: Read a file from the repository.
 * - github_get_project_metadata: Fetch README and manifest.
 *
 * @param server The MCP server instance.
 * @param github The initialized GitHub adapter.
 */
export declare function registerGitHubTools(server: McpServer, github: GitHubAdapter): void;
