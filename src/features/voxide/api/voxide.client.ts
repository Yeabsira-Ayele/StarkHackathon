import { VoxideClient } from '@voxide/react';

const publicKey =
  import.meta.env.VITE_VOXIDE_PUBLIC_KEY ||
  'vox_pub_5f51bc3679ead9b2084739275c75beb0b3bbc6f6dd8cf7fd';

export const voxideClient = new VoxideClient({
  publicKey,
});
