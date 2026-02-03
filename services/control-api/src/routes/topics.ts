import { Router } from 'express';
import { createTopic, fetchTopicOffsets, listTopics } from '../lib/kafka.js';
import { log } from './helpers.js';

type KafkaApi = {
  createTopic: typeof createTopic;
  listTopics: typeof listTopics;
  fetchTopicOffsets: typeof fetchTopicOffsets;
};

let kafkaApi: KafkaApi = {
  createTopic,
  listTopics,
  fetchTopicOffsets
};

export function setKafkaApiForTests(api: KafkaApi) {
  kafkaApi = api;
}

function currentKafka(): KafkaApi {
  return kafkaApi;
}

export function topicRoutes() {
  const router = Router();

  router.post('/topics', async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const partitions = Number(req.body?.partitions ?? 1);
    const replication = Number(req.body?.replication ?? 1);
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!Number.isInteger(partitions) || partitions < 1) return res.status(400).json({ error: 'partitions must be >=1' });
    if (!Number.isInteger(replication) || replication < 1) return res.status(400).json({ error: 'replication must be >=1' });

    try {
      await currentKafka().createTopic(name, partitions, replication);
      log.info({ name, partitions, replication }, 'topic created');
      res.status(201).json({ name, partitions, replication });
    } catch (err) {
      log.error({ err }, 'failed to create topic');
      res.status(500).json({ error: 'failed to create topic' });
    }
  });

  router.get('/topics', async (_req, res) => {
    try {
      const topics = await currentKafka().listTopics();
      log.info({ count: topics.length }, 'fetched topics');
      res.json({ items: topics });
    } catch (err) {
      log.error({ err }, 'failed to list topics');
      res.status(500).json({ error: 'failed to list topics' });
    }
  });

  router.get('/topics/:name/metrics', async (req, res) => {
    const name = String(req.params.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
      const offsets = await currentKafka().fetchTopicOffsets(name);
      log.info({ name, partitions: offsets.length }, 'fetched topic metrics');
      res.json({ topic: name, partitions: offsets });
    } catch (err) {
      log.error({ err }, 'failed to fetch topic metrics');
      res.status(500).json({ error: 'failed to fetch topic metrics' });
    }
  });

  return router;
}
