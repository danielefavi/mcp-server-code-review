import { readFileSync } from 'fs';
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
export class PlatformFactory {
  /**
   * Creates a new GitLabAdapter instance.
   * @param token The GitLab personal access token.
   * @param url Optional custom GitLab instance URL.
   * @returns A new GitLabAdapter instance.
   */
  static createGitLab(token: string, url?: string): GitLabAdapter {
    return new GitLabAdapter(token, url);
  }

  /**
   * Creates a new GitHubAdapter instance.
   * @param token The GitHub personal access token.
   * @returns A new GitHubAdapter instance.
   */
  static createGitHub(token: string): GitHubAdapter {
    return new GitHubAdapter(token);
  }

  /**
   * Initializes available platform adapters based on environment variables.
   * Checks for GITLAB_TOKEN and GITHUB_TOKEN.
   * @returns An object containing the initialized adapters (if any).
   */
  static initializeFromEnv() {
    const gitlabToken = process.env.GITLAB_TOKEN;
    const gitlabUrl = process.env.GITLAB_URL;
    const githubToken = process.env.GITHUB_TOKEN;

    const adapters: { gitlab?: GitLabAdapter; github?: GitHubAdapter } = {};

    if (gitlabToken) {
      adapters.gitlab = this.createGitLab(gitlabToken, gitlabUrl);
    }

    if (githubToken) {
      adapters.github = this.createGitHub(githubToken);
    }

    return adapters;
  }

  /**
   * Loads custom code review guidelines from environment variables.
   * Checks CODE_REVIEW_GUIDELINES_FILE first (file path), then CODE_REVIEW_GUIDELINES (direct text).
   * @returns The custom guidelines string, or undefined if not configured.
   */
  static loadCodeReviewGuidelines(): string | undefined {
    const guidelinesFile = process.env.CODE_REVIEW_GUIDELINES_FILE;
    const guidelinesText = process.env.CODE_REVIEW_GUIDELINES;

    if (guidelinesFile) {
      try {
        return readFileSync(guidelinesFile, 'utf-8');
      } catch (error) {
        console.error(`Warning: Could not read guidelines file "${guidelinesFile}":`, error);
      }
    }

    if (guidelinesText) {
      return guidelinesText;
    }

    return undefined;
  }
}
