import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app.js';

test('workspace CRUD basic happy path', async () => {
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri().replace(/\/+$/, '');
  process.env.MONGO_DB = 'testdb';

  const app = createApp();

  const createRes = await request(app).post('/api/workspaces').send({ id: 'ws1', name: 'Acme', description: 'Desc', allowedOrigins: ['https://a.example.com'] });
  assert.equal(createRes.status, 201);

  const listRes = await request(app).get('/api/workspaces');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.items.length, 1);

  const getRes = await request(app).get('/api/workspaces/ws1');
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.description, 'Desc');
  assert.deepEqual(getRes.body.allowedOrigins, ['https://a.example.com']);

  const updateRes = await request(app).put('/api/workspaces/ws1').send({ name: 'Acme Updated', description: 'New Desc', allowedOrigins: ['http://localhost:3000'] });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.description, 'New Desc');
  assert.deepEqual(updateRes.body.allowedOrigins, ['http://localhost:3000']);

  const getUpdatedRes = await request(app).get('/api/workspaces/ws1');
  assert.equal(getUpdatedRes.status, 200);
  assert.equal(getUpdatedRes.body.name, 'Acme Updated');
  assert.equal(getUpdatedRes.body.description, 'New Desc');
  assert.deepEqual(getUpdatedRes.body.allowedOrigins, ['http://localhost:3000']);

  await mongoose.disconnect();
  await mem.stop();
});
