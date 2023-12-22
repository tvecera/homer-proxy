import { Router, Request, Response } from 'express';
import { Controller } from 'node-unifi';
import { IConfig } from '../config';

export default function unifi(config: IConfig): Router {
  const router = Router();

  router.get('/unifi/sites/:index', async (req: Request, res: Response) => {
    const index = req.params.index;

    if (!config.unifi || !config.unifi.password) {
      req.log.error('UniFi configuration not found');
      res.status(404).send('UniFi configuration not found');
    } else {
      const unifi = new Controller({
        host: config.unifi.host,
        port: config.unifi.port,
        sslverify: false,
      });

      try {
        const logged = await unifi.login(
          config.unifi.username,
          config.unifi.password
        );
        if (logged) {
          const sites = await unifi.getSitesStats();
          await unifi.logout();
          res.json(sites[index]);
        } else {
          res.status(401).send('UniFi login failed');
        }
      } catch (error) {
        res.log.error('ERROR: ' + error);
        res.status(500).send('Internal Server Error');
      }
    }
  });

  return router;
}
