const { copy } = require('fs-extra');
const path = require('path');

module.exports = { copyChangedFiles, parseCommaList };

/**
 * @param  {Array} filesList list of files that need to be copied
 * @param  {String} destination where file should be copied
 */
async function copyChangedFiles(filesList, fileListFolder, destination, destinationFolder) {
  await Promise.all(filesList.map(async filepath => {
    return await copy(path.join(process.cwd(), path.join(fileListFolder, filepath)), path.join(destination, path.join(destinationFolder,filepath)));
  }));
}

/**
 * @param  {String} list names of values that can be separated by comma
 * @returns  {Array<String>} input names not separated by string but as separate array items
 */
function parseCommaList(list) {
  return list.split(',').map(i => i.trim().replace(/['"]+/g, ''));
}