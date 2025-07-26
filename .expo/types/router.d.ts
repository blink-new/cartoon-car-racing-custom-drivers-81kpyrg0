/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/car-selection`; params?: Router.UnknownInputParams; } | { pathname: `/photo-upload`; params?: Router.UnknownInputParams; } | { pathname: `/race`; params?: Router.UnknownInputParams; } | { pathname: `/results`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/car-selection`; params?: Router.UnknownOutputParams; } | { pathname: `/photo-upload`; params?: Router.UnknownOutputParams; } | { pathname: `/race`; params?: Router.UnknownOutputParams; } | { pathname: `/results`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/car-selection${`?${string}` | `#${string}` | ''}` | `/photo-upload${`?${string}` | `#${string}` | ''}` | `/race${`?${string}` | `#${string}` | ''}` | `/results${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/car-selection`; params?: Router.UnknownInputParams; } | { pathname: `/photo-upload`; params?: Router.UnknownInputParams; } | { pathname: `/race`; params?: Router.UnknownInputParams; } | { pathname: `/results`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
