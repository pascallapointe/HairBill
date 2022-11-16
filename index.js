/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './i18n';
import App from './App';
import { name as appName } from './app.json';
import database from '@react-native-firebase/database';

database().setPersistenceEnabled(true);
database().setPersistenceCacheSizeBytes(10000000); // 10MB

AppRegistry.registerComponent(appName, () => App);
