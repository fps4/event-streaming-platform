import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setKafkaApiForTests } from '../../src/routes/topics.js';

test('topic create/list/metrics', async () => {
  const createTopicSpy = mock.fn(async () => {});
  const listTopicsSpy = mock.fn(async () => ['a', 'b']);
  const fetchTopicOffsetsSpy = mock.fn(async () => [
    { topic: 'a', partition: 0, startOffset: '0', endOffset: '10', offsetLag: '10' }
  ]);

  setKafkaApiForTests({
    createTopic: createTopicSpy as any,
    listTopics: listTopicsSpy as any,
    fetchTopicOffsets: fetchTopicOffsetsSpy as any
  });

  const { createApp } = await import('../../src/app.js');
  const app = createApp();

  const createRes = await request(app).post('/api/topics').send({ name: 'a', partitions: 1, replication: 1 });
  assert.equal(createRes.status, 201);
  assert.deepEqual(createRes.body, { name: 'a', partitions: 1, replication: 1 });
  assert.equal(createTopicSpy.mock.callCount(), 1);

  const listRes = await request(app).get('/api/topics');
  assert.equal(listRes.status, 200);
  assert.deepEqual(listRes.body, { items: ['a', 'b'] });
  assert.equal(listTopicsSpy.mock.callCount(), 1);

  const metricsRes = await request(app).get('/api/topics/a/metrics');
  assert.equal(metricsRes.status, 200);
  assert.deepEqual(metricsRes.body, { topic: 'a', partitions: [
    { topic: 'a', partition: 0, startOffset: '0', endOffset: '10', offsetLag: '10' }
  ] });
  assert.equal(fetchTopicOffsetsSpy.mock.callCount(), 1);
});
