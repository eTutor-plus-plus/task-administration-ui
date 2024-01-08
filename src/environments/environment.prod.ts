import { gitInfo, version } from './version';

export const environment = {
  apiUrl: 'https://etutor.dke.uni-linz.ac.at', // must not end with slash
  impressUrl: 'http://dke.jku.at/legal_notice.html',
  clientId: 'task-admin-ui',
  version: version,
  git: gitInfo
};
