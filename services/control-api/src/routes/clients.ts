import { Router } from 'express';
import { makeModels } from '@event-streaming-platform/data-models';
import { getConnection } from '../lib/db.js';
import { log, toId } from './helpers.js';

export function clientRoutes() {
  const router = Router({ mergeParams: true });

  router.get('/workspaces/:id/clients', async (req, res) => {
    const conn = await getConnection();
    const { Client } = makeModels(conn);
    const items = await Client.find({ workspaceId: toId(req.params.id) }).lean().exec();
    res.json({ items });
  });

  router.post('/workspaces/:id/clients', async (req, res) => {
    const conn = await getConnection();
    const { Client } = makeModels(conn);
    const _id = toId(req.body?.id || req.body?._id);
    const secretHash = String(req.body?.secretHash || '').trim();
    if (!_id || !secretHash) return res.status(400).json({ error: 'id and secretHash are required' });
    const doc = await Client.create({
      _id,
      workspaceId: toId(req.params.id),
      status: 'active',
      secretHash,
      secretSalt: req.body?.secretSalt ?? null,
      allowedScopes: Array.isArray(req.body?.allowedScopes) ? req.body.allowedScopes : [],
      allowedTopics: Array.isArray(req.body?.allowedTopics) ? req.body.allowedTopics : []
    });
    log.info({ clientId: _id, workspaceId: req.params.id }, 'client created');
    res.status(201).json(doc);
  });

  return router;
}
