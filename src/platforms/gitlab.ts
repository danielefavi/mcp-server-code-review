import { Gitlab } from '@gitbeaker/rest';
import { GitPlatform, MergeRequestDetails, FileDiff } from './base.js';

export class GitLabAdapter implements GitPlatform {
  private client: any;

  constructor(token: string, baseUrl?: string) {
    this.client = new Gitlab({
      host: baseUrl || 'https://gitlab.com',
      token,
    });
  }

  async listMergeRequests(repoId: string, status: string = 'opened'): Promise<MergeRequestDetails[]> {
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

  async readFileContent(repoId: string, filePath: string, ref?: string): Promise<string> {
    const file = await this.client.RepositoryFiles.show(repoId, filePath, ref || 'main');
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }

  async getProjectMetadata(repoId: string): Promise<{ readme?: string; manifest?: string }> {
    let readme: string | undefined;
    let manifest: string | undefined;

    try {
      readme = await this.readFileContent(repoId, 'README.md');
    } catch (e) {
      // Ignore if not found
    }

    const manifestFiles = ['package.json', 'go.mod', 'Cargo.toml', 'requirements.txt', 'pom.xml', 'composer.json'];
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
