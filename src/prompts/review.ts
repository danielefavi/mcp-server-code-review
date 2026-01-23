import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import PromptBuilder from './prompt-builder.js';
import { codeReviewGuidelines, githubTemplate, gitlabTemplate } from './constants.js';

/**
 * Registers prompt templates for code reviews with the MCP server.
 * 
 * Registered prompts:
 * - review_merge_request: A guided prompt for reviewing GitLab merge requests.
 * - review_pull_request: A guided prompt for reviewing GitHub pull requests.
 * 
 * @param server The MCP server instance.
 */
export function registerReviewPrompts(server: McpServer) {
  server.registerPrompt(
    'review_merge_request',
    {
      description: 'Guided code review for a GitLab Merge Request',
      argsSchema: {
        repoId: z.string().describe('Project ID or path'),
        mrId: z.string().describe('Merge Request ID'),
      },
    },
    ({ repoId, mrId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: new PromptBuilder(gitlabTemplate)
              .replaceWildCard('{{MR_ID}}', mrId)
              .replaceWildCard('{{REPO_ID}}', repoId)
              .addParagraph(codeReviewGuidelines) // TODO: let's give the user the option to set the guidelines from config
              .get(),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'review_pull_request',
    {
      description: 'Guided code review for a GitHub Pull Request',
      argsSchema: {
        repoId: z.string().describe('Repository name in format owner/repo'),
        prId: z.string().describe('Pull Request number'),
      },
    },
    ({ repoId, prId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: new PromptBuilder(githubTemplate)
              .replaceWildCard('{{PR_ID}}', prId)
              .replaceWildCard('{{REPO_ID}}', repoId)
              .addParagraph(codeReviewGuidelines) // TODO: let's give the user the option to set the guidelines from config
              .get(),
          },
        },
      ],
    })
  );
}
