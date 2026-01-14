import { Gitlab } from '@gitbeaker/rest';
export class GitLabAdapter {
    client;
    constructor(token, baseUrl) {
        this.client = new Gitlab({
            host: baseUrl || 'https://gitlab.com',
            token,
        });
    }
    async listMergeRequests(repoId, status = 'opened') {
        const mrs = await this.client.MergeRequests.all({
            projectId: repoId,
            state: status,
        });
        return mrs.map((mr) => ({
            id: mr.iid.toString(),
            title: mr.title,
            description: mr.description,
            author: mr.author.username,
            sourceBranch: mr.source_branch,
            targetBranch: mr.target_branch,
            webUrl: mr.web_url,
        }));
    }
    async getMergeRequestDetails(repoId, mrId) {
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
    async getMergeRequestDiff(repoId, mrId) {
        const diffs = await this.client.MergeRequests.allDiffs(repoId, parseInt(mrId));
        return diffs.map((diff) => ({
            newPath: diff.new_path,
            oldPath: diff.old_path,
            diff: diff.diff,
            newFile: diff.new_file,
            deletedFile: diff.deleted_file,
            renamedFile: diff.renamed_file,
        }));
    }
    async readFileContent(repoId, filePath, ref) {
        const file = await this.client.RepositoryFiles.show(repoId, filePath, ref || 'main');
        return Buffer.from(file.content, 'base64').toString('utf-8');
    }
    async getProjectMetadata(repoId) {
        let readme;
        let manifest;
        try {
            readme = await this.readFileContent(repoId, 'README.md');
        }
        catch (e) {
            // Ignore if not found
        }
        const manifestFiles = ['package.json', 'go.mod', 'Cargo.toml', 'requirements.txt', 'pom.xml'];
        for (const file of manifestFiles) {
            try {
                manifest = await this.readFileContent(repoId, file);
                if (manifest)
                    break;
            }
            catch (e) {
                // Continue to next possible manifest
            }
        }
        return { readme, manifest };
    }
}
