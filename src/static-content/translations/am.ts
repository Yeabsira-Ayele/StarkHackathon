import amJson from '../../i18n/locales/am.json';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

import type { Translation } from './en.ts';

export const am: DeepPartial<Translation> = amJson;
