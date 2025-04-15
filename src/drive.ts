import { drive } from '@googleapis/drive';
import authorize from '~/auth/authorize.js';

export default drive({
  version: 'v3',
  auth: await authorize(),
});
