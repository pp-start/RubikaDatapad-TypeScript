declare module '@fontsource/roboto';

import { ManifestEntry } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: ManifestEntry[];
};