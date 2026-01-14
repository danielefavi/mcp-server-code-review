import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registers prompt templates for code reviews with the MCP server.
 *
 * Registered prompts:
 * - review_merge_request: A guided prompt for reviewing GitLab merge requests.
 * - review_pull_request: A guided prompt for reviewing GitHub pull requests.
 *
 * @param server The MCP server instance.
 */
export declare function registerReviewPrompts(server: McpServer): void;
