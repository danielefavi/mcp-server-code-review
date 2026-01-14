import { GitPlatform, MergeRequestDetails, FileDiff } from './base.js';
/**
 * GitHub implementation of the GitPlatform interface.
 * Uses the Octokit library to interact with the GitHub API.
 */
export declare class GitHubAdapter implements GitPlatform {
    private client;
    /**
     * Creates a new instance of GitHubAdapter.
     * @param token The GitHub Personal Access Token.
     */
    constructor(token: string);
    /**
     * Parses a repository ID string into owner and repo name.
     * @param repoId The repository ID in "owner/repo" format.
     * @returns An object containing owner and repo strings.
     * @throws Error if the format is invalid.
     */
    private parseRepoId;
    /**
     * Lists pull requests for a given repository.
     * @param repoId The repository name in "owner/repo" format.
     * @param status The state to filter by ('opened', 'closed', 'merged', 'all'). Defaults to 'opened'.
     * @returns A list of simplified pull request details.
     */
    listMergeRequests(repoId: string, status?: string): Promise<MergeRequestDetails[]>;
    /**
     * Retrieves full details for a specific pull request.
     * @param repoId The repository name in "owner/repo" format.
     * @param mrId The pull request number.
     * @returns The details of the pull request.
     */
    getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails>;
    /**
     * Retrieves the diffs (changes) for a specific pull request.
     * @param repoId The repository name in "owner/repo" format.
     * @param mrId The pull request number.
     * @returns A list of file differences.
     */
    getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]>;
    /**
     * Reads a file's content from the repository.
     * @param repoId The repository name in "owner/repo" format.
     * @param filePath The path to the file.
     * @param ref The branch, tag, or commit SHA. Defaults to 'main'.
     * @returns The decoded file content as a string.
     */
    readFileContent(repoId: string, filePath: string, ref?: string): Promise<string>;
    /**
     * Fetches the README and a detected manifest file (e.g. package.json) for context.
     * @param repoId The repository name in "owner/repo" format.
     * @returns An object containing the readme and manifest content if found.
     */
    getProjectMetadata(repoId: string): Promise<{
        readme?: string;
        manifest?: string;
    }>;
}
