const getRepoInfo = require('git-repo-info');
const fs = require('node:fs');

const pjson = require('./package.json');
const info = getRepoInfo();
const content = `export const gitInfo = {
  branch: '${info.branch}',
  tag: ${!info.tag ? 'null' : '\'' + info.tag + '\''},
  shortSha: '${info.abbreviatedSha}',
  commitDate: '${info.committerDate}'
};
export const version = '${pjson.version}';`

try {
  fs.writeFileSync('./src/environments/version.ts', content);
} catch (err) {
  console.error(err);
}
