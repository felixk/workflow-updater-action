const github = require('@actions/github');
const core = require('@actions/core');
const simpleGit = require('simple-git');
const path = require('path');
const { mkdir } = require('fs').promises;

const { clone, push } = require('./git');
const { copyChangedFiles, parseCommaList } = require('./utils');

async function run() {
  if (process.env.GITHUB_EVENT_NAME !== 'push') return core.setFailed('This GitHub Action works only when triggered by "push" webhook.');

  try {
    const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
    const reposToUpdate = parseCommaList(core.getInput('repos_to_update', { required: true }));
    const workflows = parseCommaList(core.getInput('workflows_to_update', { required: true }));
    const workflowFolder = "workflow-updater" || core.getInput('workflow_folder', { required: false });
    const githubUsername = core.getInput('github_username', { required: false })
    const defaultBranch = 'develop';

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const octokit = github.getOctokit(gitHubKey);

    core.info(`Starting workflow update for ${owner}.`);

    if (!workflows.length) 
      return core.info('No workflow files found.');

    for (const repo of reposToUpdate) {
      core.startGroup(`Started updating ${repo}`);
      const dir = path.join(process.cwd(), './clones', repo);
      const repoUrl = `https://${githubUsername}:${gitHubKey}@github.com/${owner}/${repo}.git`;
      await mkdir(dir, {recursive: true});

      const git = simpleGit({baseDir: dir});

      core.info(`Cloning ${repoUrl}.`);
      await clone(repoUrl, dir, git);
      core.info('Copying files...');
      await copyChangedFiles(workflows, workflowFolder, dir, '.github/workflows');
      core.info('Pushing changes to remote');
      await push(gitHubKey, repoUrl, defaultBranch, 'Updating workflows', githubUsername, '', git);
      core.info('Workflow updater complete for ${owner}.');
      core.endGroup();
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error}`);
  }
}

run();
