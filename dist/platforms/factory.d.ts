import { GitLabAdapter } from './gitlab.js';
import { GitHubAdapter } from './github.js';
export interface PlatformConfig {
    gitlab?: {
        token: string;
        url?: string;
    };
    github?: {
        token: string;
    };
}
export declare class PlatformFactory {
    static createGitLab(token: string, url?: string): GitLabAdapter;
    static createGitHub(token: string): GitHubAdapter;
    static initializeFromEnv(): {
        gitlab?: GitLabAdapter;
        github?: GitHubAdapter;
    };
}
