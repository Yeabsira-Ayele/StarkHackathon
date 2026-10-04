import omJson from '../../i18n/locales/om.json';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

import type { Translation } from './en.ts';

export const om: DeepPartial<Translation> = omJson;
