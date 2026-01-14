import { GitPlatform, MergeRequestDetails, FileDiff } from './base.js';
export declare class GitLabAdapter implements GitPlatform {
    private client;
    constructor(token: string, baseUrl?: string);
    listMergeRequests(repoId: string, status?: string): Promise<MergeRequestDetails[]>;
    getMergeRequestDetails(repoId: string, mrId: string): Promise<MergeRequestDetails>;
    getMergeRequestDiff(repoId: string, mrId: string): Promise<FileDiff[]>;
    readFileContent(repoId: string, filePath: string, ref?: string): Promise<string>;
    getProjectMetadata(repoId: string): Promise<{
        readme?: string;
        manifest?: string;
    }>;
}
