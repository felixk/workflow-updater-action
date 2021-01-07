const github = require('@actions/github');
const core = require('@actions/core');
const simpleGit = require('simple-git');
const path = require('path');
const { mkdir } = require('fs').promises;

const { clone, push } = require('./git');
const { copyChangedFiles, parseCommaList } = require('./utils');

const eventPayload = require(process.env.GITHUB_EVENT_PATH);

async function run() {
  if (process.env.GITHUB_EVENT_NAME !== 'push') return core.setFailed('This GitHub Action works only when triggered by "push" webhook.');

  try {
    const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
    const reposToUpdate = parseCommaList(core.getInput('repos_to_update', { required: true }));
    const workflows = parseCommaList(core.getInput('workflows_to_update', { required: true }));
    const workflowFolder = "workflow-updater" || core.getInput('workflow-folder', { required: false });
    const defaultBranch = 'develop';

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const octokit = github.getOctokit(gitHubKey);

    core.startGroup(`Starting workflow update for ${owner}.`);

    if (!workflows.length) 
      return core.info('No workflow files found.');
    
    core.info(`Modified files that need replication are: ${modifiedFiles}.`);
    core.endGroup();

    for (const repo of reposToUpdate) {
      core.startGroup(`Started updating ${repo}`);
      const dir = path.join(process.cwd(), './clones', repo);
      const repoUrl = 'https://github.com/' + owner + '/' + repo;
      await mkdir(dir, {recursive: true});

      const git = simpleGit({baseDir: dir});

      core.info(`Cloning ${repo}.`);
      await clone(repoUrl, dir, git);
      core.info('Copying files...');
      await copyChangedFiles(workflows, workflowFolder, dir);
      core.info('Pushing changes to remote');
      await push(gitHubKey, repoUrl, defaultBranch, 'Updating workflows', 'workflow-updater', '', git);
      core.endGroup();
      core.info('Workflow updater complete for ${owner}.');
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error}`);
  }
}

run();
