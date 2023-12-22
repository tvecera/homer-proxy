import { Request, Response, Router } from 'express';
import { IConfig } from '../config';
import { apiKeyGetRoute } from './common/general';

const ROUTER_NAME = 'prusalink';

export default function prusalink(config: IConfig): Router {
  const router = Router();

  router.get(`/${ROUTER_NAME}/*`, async (req: Request, res: Response) => {
    await apiKeyGetRoute(ROUTER_NAME, req, res, config.prusalink, 'X-Api-Key');
  });

  return router;
}
