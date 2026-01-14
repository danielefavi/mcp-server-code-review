import { Octokit } from 'octokit';
/**
 * GitHub implementation of the GitPlatform interface.
 * Uses the Octokit library to interact with the GitHub API.
 */
export class GitHubAdapter {
    client;
    /**
     * Creates a new instance of GitHubAdapter.
     * @param token The GitHub Personal Access Token.
     */
    constructor(token) {
        this.client = new Octokit({ auth: token });
    }
    /**
     * Parses a repository ID string into owner and repo name.
     * @param repoId The repository ID in "owner/repo" format.
     * @returns An object containing owner and repo strings.
     * @throws Error if the format is invalid.
     */
    parseRepoId(repoId) {
        const [owner, repo] = repoId.split('/');
        if (!owner || !repo) {
            throw new Error(`Invalid repoId: ${repoId}. Expected format: owner/repo`);
        }
        return { owner, repo };
    }
    /**
     * Lists pull requests for a given repository.
     * @param repoId The repository name in "owner/repo" format.
     * @param status The state to filter by ('opened', 'closed', 'merged', 'all'). Defaults to 'opened'.
     * @returns A list of simplified pull request details.
     */
    async listMergeRequests(repoId, status = 'opened') {
        const { owner, repo } = this.parseRepoId(repoId);
        // GitHub uses 'open', 'closed', 'all'. Map 'opened' to 'open', 'merged' is a subset of closed but we can filter.
        let state = 'open';
        if (status === 'closed' || status === 'merged') {
            state = 'closed';
        }
        else if (status === 'all') {
            state = 'all';
        }
        const { data: prs } = await this.client.rest.pulls.list({
            owner,
            repo,
            state,
        });
        let filteredPrs = prs;
        if (status === 'merged') {
            filteredPrs = prs.filter(pr => pr.merged_at !== null);
        }
        return filteredPrs.map((pr) => ({
            id: pr.number.toString(),
            title: pr.title,
            description: pr.body || '',
            author: pr.user?.login || 'unknown',
            sourceBranch: pr.head.ref,
            targetBranch: pr.base.ref,
            webUrl: pr.html_url,
        }));
    }
    /**
     * Retrieves full details for a specific pull request.
     * @param repoId The repository name in "owner/repo" format.
     * @param mrId The pull request number.
     * @returns The details of the pull request.
     */
    async getMergeRequestDetails(repoId, mrId) {
        const { owner, repo } = this.parseRepoId(repoId);
        const { data: pr } = await this.client.rest.pulls.get({
            owner,
            repo,
            pull_number: parseInt(mrId),
        });
        return {
            id: pr.number.toString(),
            title: pr.title,
            description: pr.body || '',
            author: pr.user?.login || 'unknown',
            sourceBranch: pr.head.ref,
            targetBranch: pr.base.ref,
            webUrl: pr.html_url,
        };
    }
    /**
     * Retrieves the diffs (changes) for a specific pull request.
     * @param repoId The repository name in "owner/repo" format.
     * @param mrId The pull request number.
     * @returns A list of file differences.
     */
    async getMergeRequestDiff(repoId, mrId) {
        const { owner, repo } = this.parseRepoId(repoId);
        const { data: files } = await this.client.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: parseInt(mrId),
        });
        return files.map((file) => ({
            newPath: file.filename,
            oldPath: file.previous_filename || file.filename,
            diff: file.patch || '',
            newFile: file.status === 'added',
            deletedFile: file.status === 'removed',
            renamedFile: file.status === 'renamed',
        }));
    }
    /**
     * Reads a file's content from the repository.
     * @param repoId The repository name in "owner/repo" format.
     * @param filePath The path to the file.
     * @param ref The branch, tag, or commit SHA. Defaults to 'main'.
     * @returns The decoded file content as a string.
     */
    async readFileContent(repoId, filePath, ref) {
        const { owner, repo } = this.parseRepoId(repoId);
        const { data: file } = await this.client.rest.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: ref || 'main', // GitHub default branch might be master or main, but ref usually handles it? No, if ref is missing, it uses default.
        });
        if ('content' in file && !Array.isArray(file)) {
            return Buffer.from(file.content, 'base64').toString('utf-8');
        }
        throw new Error(`File not found or is a directory: ${filePath}`);
    }
    /**
     * Fetches the README and a detected manifest file (e.g. package.json) for context.
     * @param repoId The repository name in "owner/repo" format.
     * @returns An object containing the readme and manifest content if found.
     */
    async getProjectMetadata(repoId) {
        let readme;
        let manifest;
        try {
            // GitHub has a dedicated endpoint for README but readFileContent is consistent
            readme = await this.readFileContent(repoId, 'README.md');
        }
        catch (e) {
            // Try lowercase or other common names if needed, but strict 'README.md' is common standard.
            // GitHub API for getReadme could be robust but let's stick to readFileContent for simplicity first.
            try {
                // Fallback to API specific readme if direct file fails (e.g. different casing)
                const { owner, repo } = this.parseRepoId(repoId);
                const { data: readmeData } = await this.client.rest.repos.getReadme({
                    owner,
                    repo
                });
                readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            }
            catch (ex) {
                // Ignore
            }
        }
        const manifestFiles = ['package.json', 'go.mod', 'Cargo.toml', 'requirements.txt', 'pom.xml'];
        for (const file of manifestFiles) {
            try {
                manifest = await this.readFileContent(repoId, file);
                if (manifest)
                    break;
            }
            catch (e) {
                // Continue
            }
        }
        return { readme, manifest };
    }
}
