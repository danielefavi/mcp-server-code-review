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

## Development & Local Testing

### 1. Setup
```bash
git clone <repo>
npm install
npm run build
```

### 2. Run Tests
```bash
npm test            # Run unit tests
npm run test:coverage # Run tests with coverage
```

### 3. Test with MCP Inspector
The easiest way to debug and test the server capabilities locally is using the MCP Inspector.

1. Build the project:
   ```bash
   npm run build
   ```
2. Run the inspector (passing your token inline):
   ```bash
   GITLAB_TOKEN=your_token_here npx @modelcontextprotocol/inspector node dist/index.js
   ```
3. Open the provided URL (usually `http://localhost:5173`) in your browser to interactively call tools like `gitlab_list_mrs`.

### 4. Run Directly
To run the server process directly (e.g., to verify startup logs):
```bash
GITLAB_TOKEN=your_token_here npm start
```
