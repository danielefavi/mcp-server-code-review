# Code Review MCP Server

An MCP server designed to assist in code reviews for GitLab Merge Requests.

## Features
- **List MRs:** See what needs review.
- **Get Details:** Understand the description and intent.
- **Get Diff:** Analyze the changes.
- **Get Metadata:** Understand the project's tech stack (README, package.json, etc.).
- **Guided Review Prompt:** A built-in prompt that guides the LLM to act as a Principal Engineer and explicitly ask for issue/ticket context.

## Setup

1. **Clone and Install:**
   ```bash
   npm install
   npm run build
   ```

2. **Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   GITLAB_TOKEN=your_token_here
   GITLAB_URL=https://gitlab.com
   ```

3. **Configure MCP Client:**
   Add the following to your MCP client configuration (e.g., Claude Desktop, etc.):

   ```json
   {
     "mcpServers": {
       "code-review": {
         "command": "node",
         "args": ["/absolute/path/to/code-review-mcp/dist/index.js"],
         "env": {
           "GITLAB_TOKEN": "your_token_here",
           "GITLAB_URL": "https://gitlab.com"
         }
       }
     }
   }
   ```

## Usage

You can ask the LLM:
- "What are the open merge requests in project 'my-org/my-project'?"
- "Review this merge request: https://gitlab.com/my-org/my-project/-/merge_requests/123"
- Use the `review_merge_request` prompt for a guided, professional review.
