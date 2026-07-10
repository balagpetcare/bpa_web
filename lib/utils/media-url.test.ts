import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMediaUrl } from './media-url';

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000/api/v1';

test('resolveMediaUrl normalizes relative upload paths', () => {
  assert.equal(resolveMediaUrl('/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
  assert.equal(resolveMediaUrl('uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
});

test('resolveMediaUrl rewrites stale development hosts to current API origin', () => {
  assert.equal(resolveMediaUrl('http://127.0.0.1:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
  assert.equal(resolveMediaUrl('http://10.0.2.2:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
  assert.equal(resolveMediaUrl('http://192.168.10.111:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
  assert.equal(resolveMediaUrl('http://192.168.1.25:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg');
});

test('resolveMediaUrl preserves production/external URLs and handles nullish values', () => {
  assert.equal(resolveMediaUrl('https://cdn.example.com/media/file.jpg'), 'https://cdn.example.com/media/file.jpg');
  assert.equal(resolveMediaUrl('https://f005.backblazeb2.com/file/example.jpg'), 'https://f005.backblazeb2.com/file/example.jpg');
  assert.equal(resolveMediaUrl(null), null);
  assert.equal(resolveMediaUrl(''), null);
});
