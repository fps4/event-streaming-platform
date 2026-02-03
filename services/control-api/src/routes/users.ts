import { Router } from 'express';
import { makeModels } from '@event-streaming-platform/data-models';
import { getConnection } from '../lib/db.js';
import { log, toId } from './helpers.js';

export function userRoutes() {
  const router = Router({ mergeParams: true });

  router.get('/workspaces/:id/users', async (req, res) => {
    const conn = await getConnection();
    const { User } = makeModels(conn);
    const items = await User.find({ workspaceId: toId(req.params.id) }).lean().exec();
    res.json({ items });
  });

  router.post('/workspaces/:id/users', async (req, res) => {
    const conn = await getConnection();
    const { User } = makeModels(conn);
    const _id = toId(req.body?.id || req.body?._id);
    const username = String(req.body?.username || '').trim();
    if (!_id || !username) return res.status(400).json({ error: 'id and username are required' });
    const doc = await User.create({
      _id,
      workspaceId: toId(req.params.id),
      username,
      passwordHash: req.body?.passwordHash ?? null,
      passwordSalt: req.body?.passwordSalt ?? null,
      roles: Array.isArray(req.body?.roles) ? req.body.roles : [],
      status: 'active'
    });
    log.info({ userId: _id, workspaceId: req.params.id }, 'user created');
    res.status(201).json(doc);
  });

  return router;
}
