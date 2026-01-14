/**
 * Represents the details of a Merge Request (or Pull Request).
 */
export interface MergeRequestDetails {
  /** The unique identifier of the merge request (e.g., number or IID). */
  id: string;
  /** The title of the merge request. */
  title: string;
  /** The full description body of the merge request. */
  description: string;
  /** The username of the author who created the merge request. */
  author: string;
  /** The name of the source branch (the branch being merged). */
  sourceBranch: string;
  /** The name of the target branch (the branch being merged into). */
  targetBranch: string;
  /** The web URL to view the merge request in the browser. */
  webUrl: string;
}

/**
 * Represents the difference of a single file in a merge request.
 */
export interface FileDiff {
  /** The path of the file after changes (or new path if renamed). */
  newPath: string;
  /** The path of the file before changes (or old path if renamed). */
  oldPath: string;
  /** The diff content (patch) showing changes. */
  diff: string;
  /** Indicates if this is a newly created file. */
  newFile: boolean;
  /** Indicates if this file was deleted. */
  deletedFile: boolean;
  /** Indicates if this file was renamed. */
  renamedFile: boolean;
}

/**
 * Generic interface for Git hosting platforms (GitLab, GitHub, etc.).
 */
export interface GitPlatform {
  /**
   * Lists merge requests for a specific repository.
   * @param repoId The repository identifier (e.g., project ID or "owner/repo").
   * @param status The status to filter by (e.g., "opened", "merged", "closed").
   * @returns A promise resolving to a list of merge request details.
   */
  listMergeRequests(repoId: string, status?: string): Promise<MergeRequestDetails[]>;

  /**
   * Retrieves detailed information about a specific merge request.
   * @param repoId The repository identifier.
   * @param mrId The merge request identifier.
   * @returns A promise resolving to the merge request details.
   */
  getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails>;

  /**
   * Retrieves the file changes (diffs) for a specific merge request.
   * @param repoId The repository identifier.
   * @param mrId The merge request identifier.
   * @returns A promise resolving to a list of file diffs.
   */
  getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]>;

  /**
   * Reads the content of a specific file from the repository.
   * @param repoId The repository identifier.
   * @param filePath The path to the file within the repository.
   * @param ref The branch, tag, or commit SHA to read from (defaults to main/master).
   * @returns A promise resolving to the file content as a string.
   */
  readFileContent(repoId: string, filePath: string, ref?: string): Promise<string>;

  /**
   * Fetches project metadata such as the README and manifest file (e.g., package.json).
   * @param repoId The repository identifier.
   * @returns A promise resolving to an object containing the readme and manifest content.
   */
  getProjectMetadata(repoId: string): Promise<{ readme?: string; manifest?: string }>;
}
