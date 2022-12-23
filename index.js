/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './i18n';
import App from './App';
import { name as appName } from './app.json';

import firestore from '@react-native-firebase/firestore';
firestore()
  .settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  })
  .catch(console.error);

AppRegistry.registerComponent(appName, () => App);
