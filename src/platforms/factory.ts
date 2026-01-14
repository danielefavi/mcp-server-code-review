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

export class PlatformFactory {
  static createGitLab(token: string, url?: string): GitLabAdapter {
    return new GitLabAdapter(token, url);
  }

  static createGitHub(token: string): GitHubAdapter {
    return new GitHubAdapter(token);
  }

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
}
