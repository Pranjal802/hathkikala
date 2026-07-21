import { z } from 'zod';

// Validates a 24-char hex string looks like a Mongo ObjectId.
// (Doesn't guarantee the document exists — just a cheap format check
// before we even hit the DB.)
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');
