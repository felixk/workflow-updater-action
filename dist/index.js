module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 218:
/***/ ((module) => {

module.exports = {clone, push};

async function clone(remote, dir, git) {
  return await git
    .clone(remote, dir, {'--depth': 1});
}

async function push(token, url, branchName, message, committerUsername, committerEmail, git) {
  const authenticatedUrl = (token, url, user) => {
    const arr = url.split('//');
    return `https://${user}:${token}@${arr[arr.length - 1]}`;
  };

  return await git
    .add('./*')
    .addConfig('user.name', committerUsername)
    .addConfig('user.email', committerEmail)
    .commit(message)
    .addRemote('auth', authenticatedUrl(token, url, committerUsername))
    .push(['-u', 'auth', branchName]);
}
  

/***/ }),

/***/ 582:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const github = __nccwpck_require__(717);
const core = __nccwpck_require__(934);
const simpleGit = __nccwpck_require__(286);
const path = __nccwpck_require__(622);
const { mkdir } = __nccwpck_require__(747).promises;

const { clone, push } = __nccwpck_require__(218);
const { copyChangedFiles, parseCommaList } = __nccwpck_require__(332);

const eventPayload = require(process.env.GITHUB_EVENT_PATH);

async function run() {
  if (process.env.GITHUB_EVENT_NAME !== 'push') return core.setFailed('This GitHub Action works only when triggered by "push" webhook.');

  try {
    const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
    const reposToUpdate = parseCommaList(core.getInput('repos_to_update', { required: true }));
    const workflows = parseCommaList(core.getInput('workflows_to_update', { required: true }));
    const workflowFolder = "workflow-updater" || 0;
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


/***/ }),

/***/ 332:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { copy } = __nccwpck_require__(400);
const path = __nccwpck_require__(622);

module.exports = { copyChangedFiles, parseCommaList };

/**
 * @param  {Array} filesList list of files that need to be copied
 * @param  {String} destination where file should be copied
 */
async function copyChangedFiles(filesList, fileListFolder, destination) {
  await Promise.all(filesList.map(async filepath => {
    return await copy(path.join(process.cwd(), path.join(fileListFolder, filepath)), path.join(destination, filepath));
  }));
}

/**
 * @param  {String} list names of values that can be separated by comma
 * @returns  {Array<String>} input names not separated by string but as separate array items
 */
function parseCommaList(list) {
  return list.split(',').map(i => i.trim().replace(/['"]+/g, ''));
}

/***/ }),

/***/ 934:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 717:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 400:
/***/ ((module) => {

module.exports = eval("require")("fs-extra");


/***/ }),

/***/ 286:
/***/ ((module) => {

module.exports = eval("require")("simple-git");


/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(582);
/******/ })()
;