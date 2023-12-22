import * as fs from 'fs';
import * as yaml from 'js-yaml';
import getLogger from './logger';
import { Logger } from 'pino';

export interface ConfigItem {
  host: string;
  port?: string;
  type: GrantType;
  username?: string;
  password?: string;
  apikey?: string;
}

export enum GrantType {
  credentials = 'credentials',
  apikey = 'apikey',
}

interface MultipleConfigItem extends ConfigItem {
  name: string;
}

export interface IConfig {
  server: {
    port: number;
    debug: boolean;
  };
  unifi?: ConfigItem;
  prusalink?: ConfigItem;
  fibaro?: ConfigItem;
  pihole?: ConfigItem;
  portainer?: ConfigItem;
  wud?: ConfigItem;
  osmc: MultipleConfigItem[];
  tasmota: MultipleConfigItem[];
}

let config: IConfig;

let logger: Logger<never>;

/**
 * Retrieves secrets (like API keys and passwords) from environment variables and assigns them to the configuration
 * items.
 *
 * @param {IConfig | MultipleConfigItem[]} items - The configuration items which may require secrets.
 *                                                 This can be either a single configuration object or an array of
 *                                                 configuration items.
 * @param {string} [parent] - Optional. The parent name for nested configuration items, used to build the environment
 *                            variable names.
 */
function getSecrets(items: IConfig | MultipleConfigItem[], parent?: string) {
  for (const key in items) {
    const item = items[key];
    const baseName = item.name?.toUpperCase() || key.toUpperCase();
    const itemName = parent ? `${parent.toUpperCase()}_${baseName}` : baseName;

    if (Array.isArray(item)) {
      getSecrets(item, itemName);
    } else if (item.type !== undefined) {
      switch (item.type) {
        case GrantType.apikey:
          item.apikey = process.env[`${itemName}_API_KEY`];
          logger.info(`  - ${itemName}_API_KEY`);
          break;
        case GrantType.credentials:
          item.password = process.env[`${itemName}_PASSWORD`];
          logger.info(`  - ${itemName}_PASSWORD`);
          break;
      }
    }
  }
}

try {
  const configFile = process.env.CONFIG_FILE_PATH || './config/config.yml';
  const fileContents = fs.readFileSync(configFile, 'utf8');
  config = yaml.load(fileContents) as IConfig;
  const logLevel = config.server.debug ? 'debug' : 'info';
  logger = getLogger(logLevel);
  logger.info('Mandatory environment properties: ');
  getSecrets(config);
} catch (e) {
  console.error(e);
  process.exit(1);
}

export default config;
