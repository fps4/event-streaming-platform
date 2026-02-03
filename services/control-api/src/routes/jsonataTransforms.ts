import { Router } from 'express';
import { makeModels } from '@event-streaming-platform/data-models';
import { getConnection } from '../lib/db.js';
import { log, toId, toNumberOrNull } from './helpers.js';

export function jsonataTransformRoutes() {
  const router = Router({ mergeParams: true });

  router.get('/workspaces/:id/jsonata-transforms', async (req, res) => {
    const conn = await getConnection();
    const { JsonataTransform } = makeModels(conn);
    const items = await JsonataTransform.find({ workspaceId: toId(req.params.id) }).lean().exec();
    res.json({ items });
  });

  router.post('/workspaces/:id/jsonata-transforms', async (req, res) => {
    const conn = await getConnection();
    const { JsonataTransform } = makeModels(conn);
    const _id = toId(req.body?.id || req.body?._id);
    const name = String(req.body?.name || '').trim();
    const expression = String(req.body?.expression || '').trim();
    const sourceTopic = String(req.body?.sourceTopic || '').trim();
    const targetTopic = String(req.body?.targetTopic || '').trim();
    const version = Number(req.body?.version ?? 1);
    const status = (req.body?.status || 'draft') as unknown;

    if (!_id || !name || !expression || !sourceTopic || !targetTopic) {
      return res.status(400).json({ error: 'id, name, expression, sourceTopic, and targetTopic are required' });
    }

    if (!Number.isInteger(version) || version < 1) {
      return res.status(400).json({ error: 'version must be >=1' });
    }

    if (status !== 'draft' && status !== 'active' && status !== 'deprecated') {
      return res.status(400).json({ error: 'status must be draft|active|deprecated' });
    }

    const doc = await JsonataTransform.create({
      _id,
      workspaceId: toId(req.params.id),
      name,
      expression,
      sourceTopic,
      targetTopic,
      version,
      status,
      description: req.body?.description || undefined,
      sourceSchemaId: toNumberOrNull(req.body?.sourceSchemaId) ?? undefined,
      targetSchemaId: toNumberOrNull(req.body?.targetSchemaId) ?? undefined,
      createdBy: req.body?.createdBy || undefined,
      updatedBy: req.body?.updatedBy || undefined
    });

    log.info({ jsonataTransformId: _id, workspaceId: req.params.id }, 'jsonata transform created');
    res.status(201).json(doc);
  });

  router.put('/workspaces/:id/jsonata-transforms/:transformId', async (req, res) => {
    const conn = await getConnection();
    const { JsonataTransform } = makeModels(conn);
    const _id = toId(req.params.transformId);
    if (!_id) return res.status(400).json({ error: 'transformId is required' });

    const updates: Record<string, unknown> = {};

    if (req.body?.name !== undefined) {
      const name = String(req.body.name || '').trim();
      if (!name) return res.status(400).json({ error: 'name cannot be empty' });
      updates.name = name;
    }

    if (req.body?.expression !== undefined) {
      const expression = String(req.body.expression || '').trim();
      if (!expression) return res.status(400).json({ error: 'expression cannot be empty' });
      updates.expression = expression;
    }

    if (req.body?.sourceTopic !== undefined) {
      const sourceTopic = String(req.body.sourceTopic || '').trim();
      if (!sourceTopic) return res.status(400).json({ error: 'sourceTopic cannot be empty' });
      updates.sourceTopic = sourceTopic;
    }

    if (req.body?.targetTopic !== undefined) {
      const targetTopic = String(req.body.targetTopic || '').trim();
      if (!targetTopic) return res.status(400).json({ error: 'targetTopic cannot be empty' });
      updates.targetTopic = targetTopic;
    }

    if (req.body?.version !== undefined) {
      const version = Number(req.body.version);
      if (!Number.isInteger(version) || version < 1) return res.status(400).json({ error: 'version must be >=1' });
      updates.version = version;
    }

    if (req.body?.status !== undefined) {
      const status = req.body.status;
      if (status !== 'draft' && status !== 'active' && status !== 'deprecated') {
        return res.status(400).json({ error: 'status must be draft|active|deprecated' });
      }
      updates.status = status;
    }

    if (req.body?.description !== undefined) {
      updates.description = String(req.body.description || '');
    }

    if (req.body?.sourceSchemaId !== undefined) {
      const id = toNumberOrNull(req.body.sourceSchemaId);
      updates.sourceSchemaId = id ?? undefined;
    }

    if (req.body?.targetSchemaId !== undefined) {
      const id = toNumberOrNull(req.body.targetSchemaId);
      updates.targetSchemaId = id ?? undefined;
    }

    if (req.body?.updatedBy !== undefined) {
      updates.updatedBy = String(req.body.updatedBy || '').trim() || undefined;
    }

    const doc = await JsonataTransform.findOneAndUpdate(
      { _id, workspaceId: toId(req.params.id) },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean().exec();

    if (!doc) return res.status(404).json({ error: 'transform not found' });

    log.info({ jsonataTransformId: _id, workspaceId: req.params.id }, 'jsonata transform updated');
    res.json(doc);
  });

  return router;
}
