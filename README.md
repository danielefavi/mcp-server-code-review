# Code Review MCP Server

An MCP server designed to assist in code reviews for GitLab Merge Requests.
This server is intended to be used with an MCP client (like Claude Desktop) and requires a GitLab Personal Access Token.

## Features
- **List MRs:** See what needs review.
- **Get Details:** Understand the description and intent.
- **Get Diff:** Analyze the changes.
- **Get Metadata:** Understand the project's tech stack (README, package.json, etc.).
- **Guided Review Prompt:** A built-in prompt that guides the LLM to act as a Principal Engineer and explicitly ask for issue/ticket context.

## Installation

### Global Install (Recommended)
You can install the server globally using npm:

```bash
npm install -g code-review-mcp
```

## Configuration

The server requires the following environment variables. **You do not need a `.env` file.** Instead, pass these variables in your MCP Client configuration.

- `GITLAB_TOKEN`: Your GitLab Personal Access Token.
- `GITLAB_URL`: (Optional) Base URL for GitLab (defaults to `https://gitlab.com`).

### Example: Claude Desktop Config

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "code-review": {
      "command": "code-review-mcp",
      "env": {
        "GITLAB_TOKEN": "your_token_here",
        "GITLAB_URL": "https://gitlab.com"
      }
    }
  }
}
```

## Development

1. **Clone and Install:**
   ```bash
   git clone <repo>
   npm install
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Test:**
   ```bash
   npm test
   ```