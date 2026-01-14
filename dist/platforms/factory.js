import { GitLabAdapter } from './gitlab.js';
import { GitHubAdapter } from './github.js';
export class PlatformFactory {
    static createGitLab(token, url) {
        return new GitLabAdapter(token, url);
    }
    static createGitHub(token) {
        return new GitHubAdapter(token);
    }
    static initializeFromEnv() {
        const gitlabToken = process.env.GITLAB_TOKEN;
        const gitlabUrl = process.env.GITLAB_URL;
        const githubToken = process.env.GITHUB_TOKEN;
        const adapters = {};
        if (gitlabToken) {
            adapters.gitlab = this.createGitLab(gitlabToken, gitlabUrl);
        }
        if (githubToken) {
            adapters.github = this.createGitHub(githubToken);
        }
        return adapters;
    }
}
