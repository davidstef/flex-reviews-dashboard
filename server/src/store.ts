import { JSONFilePreset } from 'lowdb/node';
import { NormalizedReview } from './types.js';

type DB = {
  approvals: Record<string, boolean>;
};

export const db = await JSONFilePreset<DB>('data.db.json', { approvals: {} });

export async function setApproval(reviewId: string, approved: boolean) {
  db.data.approvals[reviewId] = approved;
  await db.write();
}

export function getApproval(reviewId: string): boolean | undefined {
  return db.data.approvals[reviewId];
}
