import type { Types } from 'typescript-cookie';
import { Cookies } from 'typescript-cookie';

import isBrowser from './isBrowser';

export enum NAMES {
  NAV_BAR_COLLAPSED='nav_bar_collapsed',
  NETWORK_TYPE='network_type',
  NETWORK_SUB_TYPE='network_sub_type',
}

export function get(name?: string | undefined | null) {
  if (!isBrowser()) {
    return () => {};
  }
  return Cookies.get(name);
}

export function set(name: string, value: string, attributes: Types.CookieAttributes = {}) {
  attributes.path = '/';

  return Cookies.set(name, value, attributes);
}