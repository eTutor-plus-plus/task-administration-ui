import { gitInfo, version } from './version';

export const environment = {
  apiUrl: window.origin, // must not end with slash
  impressUrl: 'http://dke.jku.at/legal_notice.html',
  clientId: 'task-admin-ui',
  version: version,
  git: gitInfo
};
