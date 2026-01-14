export interface MergeRequestDetails {
    id: string;
    title: string;
    description: string;
    author: string;
    sourceBranch: string;
    targetBranch: string;
    webUrl: string;
}
export interface FileDiff {
    newPath: string;
    oldPath: string;
    diff: string;
    newFile: boolean;
    deletedFile: boolean;
    renamedFile: boolean;
}
export interface GitPlatform {
    listMergeRequests(repoId: string, status?: string): Promise<MergeRequestDetails[]>;
    getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails>;
    getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]>;
    readFileContent(repoId: string, filePath: string, ref?: string): Promise<string>;
    getProjectMetadata(repoId: string): Promise<{
        readme?: string;
        manifest?: string;
    }>;
}
