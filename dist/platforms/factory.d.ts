import { GitLabAdapter } from './gitlab.js';
import { GitHubAdapter } from './github.js';
/**
 * Configuration for platform adapters.
 */
export interface PlatformConfig {
    gitlab?: {
        token: string;
        url?: string;
    };
    github?: {
        token: string;
    };
}
/**
 * Factory class for creating and initializing platform adapters.
 * Encapsulates the logic for checking environment variables and instantiating the correct adapters.
 */
export declare class PlatformFactory {
    /**
     * Creates a new GitLabAdapter instance.
     * @param token The GitLab personal access token.
     * @param url Optional custom GitLab instance URL.
     * @returns A new GitLabAdapter instance.
     */
    static createGitLab(token: string, url?: string): GitLabAdapter;
    /**
     * Creates a new GitHubAdapter instance.
     * @param token The GitHub personal access token.
     * @returns A new GitHubAdapter instance.
     */
    static createGitHub(token: string): GitHubAdapter;
    /**
     * Initializes available platform adapters based on environment variables.
     * Checks for GITLAB_TOKEN and GITHUB_TOKEN.
     * @returns An object containing the initialized adapters (if any).
     */
    static initializeFromEnv(): {
        gitlab?: GitLabAdapter;
        github?: GitHubAdapter;
    };
}
