import { Environment } from 'src/app/shared/helpers/config';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://dev.algorea.org/api',
  oauthServerUrl: 'https://login.france-ioi.org',
  oauthClientId: '43',

  defaultActivityId: '1352246428241737349',
  defaultSkillId: '3000',

  languages: [
    { tag: 'fr', path: '/' },
    { tag: 'en', path: '/en/' },
  ],
  allowForcedToken: true,
  authType: 'tokens',
  secure: true,
  sameSite: false,
};
