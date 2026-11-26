import { gitInfo, version } from './version';

let base = document.baseURI;
let slashIdx = base.lastIndexOf('/');
if (slashIdx > 0)
  base = base.substring(0, slashIdx);

slashIdx = base.lastIndexOf('/');
if (slashIdx > 0)
  base = base.substring(0, slashIdx);

console.log(`API-URL: ${base}`);
export const environment = {
  apiUrl: base, // must not end with slash
  impressUrl: 'http://dke.jku.at/legal_notice.html',
  clientId: 'task-admin-ui',
  version: version,
  git: gitInfo
};
