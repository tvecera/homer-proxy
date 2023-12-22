import { Router, Request, Response } from 'express';
import { IConfig } from '../config';
import { basicAuthGetRoute } from './common/general';

const ROUTER_NAME = 'tasmota';

export default function tasmota(config: IConfig): Router {
  const router = Router();

  router.get(`/${ROUTER_NAME}/:name/*`, async (req: Request, res: Response) => {
    const name = req.params.name;
    const tasmotaConfig = config.tasmota.find(config => config.name === name);
    await basicAuthGetRoute(ROUTER_NAME, req, res, tasmotaConfig);
  });

  return router;
}
