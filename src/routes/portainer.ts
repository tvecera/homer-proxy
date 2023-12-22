import { Router, Request, Response } from 'express';
import { IConfig } from '../config';
import { apiKeyGetRoute } from './common/general';

const ROUTER_NAME = 'portainer';

export default function portainer(config: IConfig): Router {
  const router = Router();

  router.get(`/${ROUTER_NAME}/*`, async (req: Request, res: Response) => {
    await apiKeyGetRoute(ROUTER_NAME, req, res, config.portainer, 'X-Api-Key');
  });

  return router;
}
