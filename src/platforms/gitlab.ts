import { Gitlab } from '@gitbeaker/rest';
import { GitPlatform, MergeRequestDetails, FileDiff } from './base.js';

/**
 * GitLab implementation of the GitPlatform interface.
 * Uses the @gitbeaker/rest library to interact with the GitLab API.
 */
export class GitLabAdapter implements GitPlatform {
  private client: any;

  /**
   * Creates a new instance of GitLabAdapter.
   * @param token The GitLab Personal Access Token.
   * @param baseUrl The base URL of the GitLab instance (defaults to https://gitlab.com).
   */
  constructor(token: string, baseUrl?: string) {
    this.client = new Gitlab({
      host: baseUrl || 'https://gitlab.com',
      token,
    });
  }

  /**
   * Lists merge requests for a given project.
   * @param repoId The project ID or URL-encoded path.
   * @param status The state to filter by ('opened', 'closed', 'merged'). Defaults to 'opened'.
   * @returns A list of simplified merge request details.
   */
  async listMergeRequests(
    repoId: string,
    status: string = 'opened'
  ): Promise<MergeRequestDetails[]> {
    const mrs = await this.client.MergeRequests.all({
      projectId: repoId,
      state: status,
    });

    return mrs.map((mr: any) => ({
      id: mr.iid.toString(),
      title: mr.title,
      description: mr.description,
      author: mr.author.username,
      sourceBranch: mr.source_branch,
      targetBranch: mr.target_branch,
      webUrl: mr.web_url,
    }));
  }

  /**
   * Retrieves full details for a specific merge request.
   * @param repoId The project ID or URL-encoded path.
   * @param mrId The internal ID (IID) of the merge request.
   * @returns The details of the merge request.
   */
  async getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails> {
    const mr = await this.client.MergeRequests.show(repoId, parseInt(mrId));
    return {
      id: mr.iid.toString(),
      title: mr.title,
      description: mr.description,
      author: mr.author.username,
      sourceBranch: mr.source_branch,
      targetBranch: mr.target_branch,
      webUrl: mr.web_url,
    };
  }

  /**
   * Retrieves the diffs (changes) for a specific merge request.
   * @param repoId The project ID or URL-encoded path.
   * @param mrId The internal ID (IID) of the merge request.
   * @returns A list of file differences.
   */
  async getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]> {
    const diffs = await this.client.MergeRequests.allDiffs(repoId, parseInt(mrId));
    return diffs.map((diff: any) => ({
      newPath: diff.new_path,
      oldPath: diff.old_path,
      diff: diff.diff,
      newFile: diff.new_file,
      deletedFile: diff.deleted_file,
      renamedFile: diff.renamed_file,
    }));
  }

  /**
   * Reads a file's content from the repository.
   * @param repoId The project ID or URL-encoded path.
   * @param filePath The path to the file.
   * @param ref The branch, tag, or commit SHA. Defaults to 'main'.
   * @returns The decoded file content as a string.
   */
  async readFileContent(repoId: string, filePath: string, ref?: string): Promise<string> {
    const file = await this.client.RepositoryFiles.show(repoId, filePath, ref || 'main');
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }

  /**
   * Fetches the README and a detected manifest file (e.g. package.json) for context.
   * @param repoId The project ID or URL-encoded path.
   * @returns An object containing the readme and manifest content if found.
   */
  async getProjectMetadata(repoId: string): Promise<{ readme?: string; manifest?: string }> {
    let readme: string | undefined;
    let manifest: string | undefined;

    try {
      readme = await this.readFileContent(repoId, 'README.md');
    } catch (e) {
      // Ignore if not found
    }

    const manifestFiles = [
      'package.json',
      'go.mod',
      'Cargo.toml',
      'requirements.txt',
      'pom.xml',
      'composer.json',
    ];
    for (const file of manifestFiles) {
      try {
        manifest = await this.readFileContent(repoId, file);
        if (manifest) break;
      } catch (e) {
        // Continue to next possible manifest
      }
    }

    return { readme, manifest };
  }
}
