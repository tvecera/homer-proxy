import { Router, Request, Response } from 'express';
import { IConfig } from '../config';
import { apiKeyGetRoute } from './common/general';

const ROUTER_NAME = 'pihole';

export default function pihole(config: IConfig): Router {
  const router = Router();

  router.get(`/${ROUTER_NAME}/*`, async (req: Request, res: Response) => {
    const query = req.query;
    query.auth = config?.pihole?.apikey;
    await apiKeyGetRoute(
      ROUTER_NAME,
      req,
      res,
      config.pihole,
      undefined,
      query
    );
  });

  return router;
}
