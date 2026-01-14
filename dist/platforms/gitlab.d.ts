import { GitPlatform, MergeRequestDetails, FileDiff } from './base.js';
/**
 * GitLab implementation of the GitPlatform interface.
 * Uses the @gitbeaker/rest library to interact with the GitLab API.
 */
export declare class GitLabAdapter implements GitPlatform {
    private client;
    /**
     * Creates a new instance of GitLabAdapter.
     * @param token The GitLab Personal Access Token.
     * @param baseUrl The base URL of the GitLab instance (defaults to https://gitlab.com).
     */
    constructor(token: string, baseUrl?: string);
    /**
     * Lists merge requests for a given project.
     * @param repoId The project ID or URL-encoded path.
     * @param status The state to filter by ('opened', 'closed', 'merged'). Defaults to 'opened'.
     * @returns A list of simplified merge request details.
     */
    listMergeRequests(repoId: string, status?: string): Promise<MergeRequestDetails[]>;
    /**
     * Retrieves full details for a specific merge request.
     * @param repoId The project ID or URL-encoded path.
     * @param mrId The internal ID (IID) of the merge request.
     * @returns The details of the merge request.
     */
    getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails>;
    /**
     * Retrieves the diffs (changes) for a specific merge request.
     * @param repoId The project ID or URL-encoded path.
     * @param mrId The internal ID (IID) of the merge request.
     * @returns A list of file differences.
     */
    getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]>;
    /**
     * Reads a file's content from the repository.
     * @param repoId The project ID or URL-encoded path.
     * @param filePath The path to the file.
     * @param ref The branch, tag, or commit SHA. Defaults to 'main'.
     * @returns The decoded file content as a string.
     */
    readFileContent(repoId: string, filePath: string, ref?: string): Promise<string>;
    /**
     * Fetches the README and a detected manifest file (e.g. package.json) for context.
     * @param repoId The project ID or URL-encoded path.
     * @returns An object containing the readme and manifest content if found.
     */
    getProjectMetadata(repoId: string): Promise<{
        readme?: string;
        manifest?: string;
    }>;
}
