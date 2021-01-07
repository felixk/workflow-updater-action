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
  