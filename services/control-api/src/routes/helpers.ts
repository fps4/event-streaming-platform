import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';
import { componentLogger } from '../lib/logger.js';

export const log = componentLogger('routes');

export function toId(input: unknown): string {
  return String(input || '').trim();
}

export function toNumberOrNull(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function withRequestIds(): RequestHandler {
  return (req, _res, next) => {
    const requestId = String(req.header('x-request-id') || randomUUID());
    const correlationId = String(req.header('x-correlation-id') || requestId);
    req.headers['x-request-id'] = requestId;
    req.headers['x-correlation-id'] = correlationId;
    next();
  };
}
