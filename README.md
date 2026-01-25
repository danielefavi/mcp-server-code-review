# Code Review MCP Server

An MCP server designed to act as a **Read-Only Intelligence Provider** for code reviews. It connects LLMs (like Claude Desktop or Gemini) to your Git hosting platforms (GitLab & GitHub) to analyze Merge/Pull Requests, understand project context, and provide expert feedback.

## Features

- **Platform Agnostic:** Supports both **GitLab** and **GitHub**.
- **List PRs/MRs:** See what needs review.
- **Get Details:** Understand the description, author, and intent.
- **Get Diff:** Retrieve and analyze code changes.
- **Read Files:** Fetch specific files from repositories at any ref (commit, branch, tag).
- **Deep Context:** Fetch `README.md` and manifest files (e.g., `package.json`, `go.mod`, `Cargo.toml`) to understand the tech stack.
- **Guided Review Prompts:** Built-in prompts that guide the LLM to act as a Principal Engineer.
- **Custom Guidelines:** Configure your own code review guidelines.

---

## Installation & Setup

You can use this MCP server in two ways:

### Option A: Global Installation (Recommended)

Install the package globally via npm:

```bash
npm install -g mcp-server-code-review
```

### Option B: Clone & Build (For Development)

Clone the repository and build it locally:

```bash
git clone <your-repo-url> mcp-server-code-review
cd mcp-server-code-review
npm install
npm run build
```

---

## Configuration

The server requires environment variables for authentication. You should add these to your MCP Client configuration (e.g., Claude Desktop).

### Environment Variables

| Variable                       | Description                                              | Required For            |
| ------------------------------ | -------------------------------------------------------- | ----------------------- |
| `GITLAB_TOKEN`                 | Your GitLab Personal Access Token.                       | GitLab                  |
| `GITLAB_URL`                   | GitLab instance URL (default: `https://gitlab.com`).     | GitLab (Self-Managed)   |
| `GITHUB_TOKEN`                 | Your GitHub Personal Access Token.                       | GitHub                  |
| `CODE_REVIEW_GUIDELINES_FILE`  | Path to a file containing custom code review guidelines. | Optional (Custom Rules) |
| `CODE_REVIEW_GUIDELINES`       | Inline custom code review guidelines text.               | Optional (Custom Rules) |

> **Note:** At least one of `GITLAB_TOKEN` or `GITHUB_TOKEN` must be provided. If `CODE_REVIEW_GUIDELINES_FILE` is set, it takes precedence over `CODE_REVIEW_GUIDELINES`.

### MCP Server Configuration

#### Using Global Installation

```json
{
  "mcpServers": {
    "code-review": {
      "command": "mcp-server-code-review",
      "env": {
        "GITLAB_TOKEN": "your_token_here",
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### Using Local Clone

Replace `/absolute/path/to/...` with the actual full path to the project directory.

```json
{
  "mcpServers": {
    "code-review": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-code-review/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_token_here",
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### With Self-Managed GitLab

```json
{
  "mcpServers": {
    "code-review": {
      "command": "mcp-server-code-review",
      "env": {
        "GITLAB_TOKEN": "your_token_here",
        "GITLAB_URL": "https://gitlab.yourcompany.com"
      }
    }
  }
}
```

#### With Custom Code Review Guidelines

You can provide custom guidelines either as a file path or inline text:

```json
{
  "mcpServers": {
    "code-review": {
      "command": "mcp-server-code-review",
      "env": {
        "GITHUB_TOKEN": "your_token_here",
        "GITLAB_TOKEN": "your_token_here",
        "GITLAB_URL": "https://gitlab.yourcompany.com",
        "CODE_REVIEW_GUIDELINES_FILE": "/path/to/your/guidelines.md"
      }
    }
  }
}
```

Or use inline guidelines:

```json
{
  "mcpServers": {
    "code-review": {
      "command": "mcp-server-code-review",
      "env": {
        "GITHUB_TOKEN": "your_token_here",
        "CODE_REVIEW_GUIDELINES": "Focus on performance and security. Ensure all functions have proper error handling."
      }
    }
  }
}
```

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json` file.

**Path locations:**

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

---

## Available Tools

### GitHub Tools

| Tool                        | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `github_list_prs`           | List pull requests with optional status filter    |
| `github_get_pr_details`     | Get detailed information about a pull request     |
| `github_get_pr_diff`        | Retrieve code changes/diff for a pull request     |
| `github_read_file`          | Read file content at a specific ref               |
| `github_get_project_metadata` | Fetch README and manifest files (package.json, etc.) |

### GitLab Tools

| Tool                        | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `gitlab_list_mrs`           | List merge requests with optional status filter   |
| `gitlab_get_mr_details`     | Get detailed information about a merge request    |
| `gitlab_get_mr_diff`        | Retrieve code changes/diff for a merge request    |
| `gitlab_read_file`          | Read file content at a specific ref               |
| `gitlab_get_project_metadata` | Fetch README and manifest files (package.json, etc.) |

---

## Available Prompts

| Prompt                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `review_merge_request`  | Guided GitLab MR review with Principal Engineer perspective |
| `review_pull_request`   | Guided GitHub PR review with Principal Engineer perspective |

These prompts instruct the LLM to:

- Act as a Principal Software Engineer
- Focus on logic errors, race conditions, security issues, and architectural alignment
- Provide structured feedback (Summary, Critical Issues, Suggestions, Nitpicks)
- Request issue/ticket details for additional context

---

## Development & Debugging

### Run Unit Tests

```bash
npm test              # Run all tests
npm run test:coverage # Run tests with coverage report
```

### Format Code

```bash
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Test with MCP Inspector

The **MCP Inspector** allows you to test the server and tool calls interactively in your browser without needing the Claude Desktop app.

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Run the Inspector:**
   (Replace tokens with your actual values)

   ```bash
   GITLAB_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
   ```

3. **Open:** `http://localhost:6274` (or the port shown in terminal).

---

## License

ISC
