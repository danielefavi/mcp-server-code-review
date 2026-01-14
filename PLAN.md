# Code Review MCP Server - Project Overview & Plan

## Goal
A Model Context Protocol (MCP) server that acts as a **Read-Only Intelligence Provider** for code reviews. It bridges the gap between LLMs and Git hosting platforms (GitHub & GitLab), allowing the LLM to analyze Pull/Merge Requests, understand project context, and provide expert feedback without modifying the repository state.

## Core Principles
1. **Read-Only:** The server never writes comments or approves PRs. It only provides data for the LLM to assist the developer in the chat.
2. **Context-Heavy:** Focus on providing not just the diff, but the "Big Picture" (README, tech stack, linked issues/context).
3. **Proactive Inquiry:** The LLM is encouraged to ask the user for external context (e.g., Jira tickets) that it cannot access directly.
4. **Platform Agnostic:** Seamlessly handles both GitHub and GitLab.

---

## Development Plan (GitLab First)

### Phase 1: Foundation & Extensible Architecture
- [x] **Project Scaffold:** TypeScript setup with MCP SDK.
- [x] **Testing Setup:** Configure Vitest for unit testing.
- [x] **Interface Design:** Define a generic `GitPlatform` interface to ensure future support for GitHub/Bitbucket.
- [x] **GitLab Implementation:** Create the `GitLabAdapter` implementing the interface with comprehensive unit tests.
- [x] **Auth & Configuration:** Support `GITLAB_TOKEN` and `GITLAB_URL` (Env variables) with unit tests.

### Phase 2: The "Review Bundle" (GitLab Focused)
- [x] `list_merge_requests`: List open/merged MRs from GitLab.
- [x] `get_merge_request_details`: Fetch title, description, and context.
- [x] `get_merge_request_diff`: Retrieve the changes via GitLab API.

### Phase 3: The "Deep Context"
- [x] `read_file_content`: Read files from GitLab repositories.
- [x] `get_project_metadata`: Fetch README/manifests from GitLab.

### Phase 4: Prompt Templates
- [x] `review_merge_request`: Optimized prompt for MRs.

### Phase 5: Future Expansion
- [ ] **GitHub Integration:** Implement `GitHubAdapter` (Post-v1).

---

## Functional Analysis of Tools

### 1. Authentication
- `GITLAB_TOKEN`: PAT for GitLab.
- `GITLAB_URL`: Base URL (default: `https://gitlab.com`).

### 2. Capabilities (GitLab API)
- **`gitlab_list_mrs`**
- **`gitlab_get_mr_details`**
- **`gitlab_get_mr_diff`**
- **`gitlab_read_file`**


## LLM Interaction Flow
1. User provides a PR URL.
2. LLM uses `get_merge_request_details` to read the description.
3. **MANDATORY STEP:** LLM asks the user: *"Please provide the detailed requirements or description from the associated issue/ticket (e.g., Jira, Linear) so I can verify the logic against the business rules."*
4. User provides the requirements.
5. LLM uses `get_merge_request_diff` and `get_project_metadata`.
6. LLM provides a comprehensive review based on code + intent + project rules.
