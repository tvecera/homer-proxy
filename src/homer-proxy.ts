import * as express from 'express';
import axios from 'axios';
import * as https from 'https';
import config from './config';
import * as cors from 'cors';
import pinoHTTP from 'pino-http';
import * as fs from 'fs';
import * as path from 'path';
import getLogger from './logger';

const app = express();
const apiPort = config.server.port; // Port for the Express server
const logLevel = config.server.debug ? 'debug' : 'info';
const logger = getLogger(logLevel);
const routesDir = path.join(__dirname, './routes');

axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
app.use(cors());
app.use(express.json());
app.use(
  pinoHTTP({ logger, useLevel: logLevel, autoLogging: config.server.debug })
);

/**
 * Asynchronously loads and sets up route modules from a specified directory.
 *
 * This function reads all files in a predefined 'routesDir' directory and
 * dynamically imports each file that ends with '.ts' as a route module.
 * It expects that each of these modules exports a default function (an Express router).
 */
async function loadRoutes() {
  const routeFiles = fs.readdirSync(routesDir);

  for (const file of routeFiles) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      logger.info(`Register ${file}.`);
      try {
        const routeFilePath = path.join(routesDir, file);
        const { default: route } = await import(routeFilePath);

        if (typeof route === 'function') {
          app.use('/proxy', route(config));
        } else {
          console.error(`The module '${file}' does not export a function`);
        }
      } catch (e) {
        console.error(`Error importing route '${file}':`, e);
      }
    }
  }
}

app.get('/healthz', (req, res) => {
  res.send('OK');
});

loadRoutes().then(() => {
  app.listen(apiPort, '0.0.0.0', () => {
    logger.info(`Server is running on port ${config.server.port}`);
    //console.info(`Server running on port ${apiPort}`);
  });
});
