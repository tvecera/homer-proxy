import { Router, Request, Response } from 'express';
import { IConfig } from '../config';
import { basicAuthGetRoute } from './common/general';

const ROUTER_NAME = 'osmc';

export default function osmc(config: IConfig): Router {
  const router = Router();

  router.post(
    `/${ROUTER_NAME}/:name/*`,
    async (req: Request, res: Response) => {
      const name = req.params.name;
      const osmcConfig = config.osmc.find(config => config.name === name);
      await basicAuthGetRoute(ROUTER_NAME, req, res, osmcConfig);
    }
  );

  return router;
}
