# Code Review MCP Server

An MCP server designed to act as a **Read-Only Intelligence Provider** for code reviews. It connects LLMs (like Claude Desktop or GEMINI) to your Git hosting platforms (GitLab & GitHub) to analyze Merge/Pull Requests, understand project context, and provide expert feedback.

## Features
- **Platform Agnostic:** Supports both **GitLab** and **GitHub**.
- **List PRs/MRs:** See what needs review.
- **Get Details:** Understand the description, author, and intent.
- **Get Diff:** Retrieve and analyze code changes.
- **Deep Context:** Fetch `README.md` and manifest files (e.g., `package.json`, `go.mod`) to understand the tech stack.
- **Guided Review Prompts:** Built-in prompts that guide the LLM to act as a Principal Engineer.

---

## Installation & Setup

You can use this MCP server in two ways:

### Option A: Global Installation (Recommended)
Install the package globally via npm:
```bash
npm install -g code-review-mcp
```

### Option B: Clone & Build (For Development)
Clone the repository and build it locally:
```bash
git clone <your-repo-url> code-review-mcp
cd code-review-mcp
npm install
npm run build
```

---

## ⚙️ Configuration

The server requires environment variables for authentication. You should add these to your MCP Client configuration (e.g., Claude Desktop).

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GITLAB_TOKEN` | Your GitLab Personal Access Token. | GitLab |
| `GITLAB_URL` | GitLab instance URL (default: `https://gitlab.com`). | GitLab (Self-Managed) |
| `GITHUB_TOKEN` | Your GitHub Personal Access Token. | GitHub |

### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json` file.

**Path locations:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### Using Global Installation
```json
{
  "mcpServers": {
    "code-review": {
      "command": "code-review-mcp",
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
      "args": ["/absolute/path/to/code-review-mcp/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_token_here",
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 🛠 Development & Debugging

### Run Unit Tests
```bash
npm test            # Run all tests
npm run test:coverage # Run tests with coverage report
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