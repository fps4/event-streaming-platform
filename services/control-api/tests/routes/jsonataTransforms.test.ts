import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app.js';
import { resetConnectionCache } from '../../src/lib/db.js';

test('jsonata transform create/list', async (t) => {
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri().replace(/\/+$/, '');
  process.env.MONGO_DB = 'testdb-jsonata';

  t.after(async () => {
    resetConnectionCache();
    await mongoose.disconnect();
    await mem.stop();
  });

  const app = createApp();

  const createRes = await request(app)
    .post('/api/workspaces/ws-jsonata/jsonata-transforms')
    .send({
      id: 'jt-1',
      name: 'orders to enriched',
      expression: '$merge([$, {status: "processed"}])',
      sourceTopic: 'dev.ws.orders.raw',
      targetTopic: 'dev.ws.orders.enriched',
      version: 1,
      status: 'draft'
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body._id, 'jt-1');

  const listRes = await request(app).get('/api/workspaces/ws-jsonata/jsonata-transforms');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.items.length, 1);
  assert.equal(listRes.body.items[0].name, 'orders to enriched');
});

test('jsonata transform update', async (t) => {
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri().replace(/\/+$/, '');
  process.env.MONGO_DB = 'testdb-jsonata-update';

  t.after(async () => {
    resetConnectionCache();
    await mongoose.disconnect();
    await mem.stop();
  });

  const app = createApp();

  const createRes = await request(app)
    .post('/api/workspaces/ws-jsonata/jsonata-transforms')
    .send({
      id: 'jt-2',
      name: 'orders to enriched',
      expression: '$merge([$, {status: "processed"}])',
      sourceTopic: 'dev.ws.orders.raw',
      targetTopic: 'dev.ws.orders.enriched',
      version: 1,
      status: 'draft'
    });
  assert.equal(createRes.status, 201);

  const updateRes = await request(app)
    .put('/api/workspaces/ws-jsonata/jsonata-transforms/jt-2')
    .send({ status: 'active', version: 2, description: 'v2' });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.status, 'active');
  assert.equal(updateRes.body.version, 2);
  assert.equal(updateRes.body.description, 'v2');
});
