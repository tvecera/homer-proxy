import { Router, Request, Response } from 'express';
import { IConfig } from '../config';
import { basicAuthGetRoute } from './common/general';

const ROUTER_NAME = 'wud';

export default function wud(config: IConfig): Router {
  const router = Router();

  router.get(`/${ROUTER_NAME}/*`, async (req: Request, res: Response) => {
    await basicAuthGetRoute(ROUTER_NAME, req, res, config.wud);
  });

  return router;
}
