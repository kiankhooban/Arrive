#!/usr/bin/env node
// Validates src/data/resources.json against the locked Arrive resource schema.

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesPath = join(__dirname, '../src/data/resources.json');

const REQUIRED_KEYS = [
  'id',
  'name',
  'description',
  'provinces',
  'eligible_statuses',
  'categories',
  'url',
  'phone',
  'last_verified',
  'notes',
];

const ALLOWED_PROVINCES = new Set(['ON']);
const ALLOWED_STATUSES = new Set([
  'refugee_claimant',
  'permanent_resident',
  'study_work_permit',
  'other',
]);
const ALLOWED_CATEGORIES = new Set(['housing', 'legal_aid', 'employment']);
const ID_PATTERN = /^on-(housing|legal|employment)-\d{3}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidIsoDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

function report(errors) {
  if (errors.length === 0) {
    console.log('PASS  resources.json matches the locked schema.');
    return;
  }

  console.error(`FAIL  resources.json has ${errors.length} schema issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

function validateResource(resource, index, seenIds) {
  const label = resource?.id ? `${resource.id}` : `resource at index ${index}`;
  const errors = [];

  if (!isPlainObject(resource)) {
    return [`${label}: entry must be an object`];
  }

  const keys = Object.keys(resource);
  const missing = REQUIRED_KEYS.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !REQUIRED_KEYS.includes(key));

  for (const key of missing) errors.push(`${label}: missing required field "${key}"`);
  for (const key of extra) errors.push(`${label}: unexpected field "${key}"`);

  if (typeof resource.id !== 'string' || !ID_PATTERN.test(resource.id)) {
    errors.push(`${label}: id must match on-(housing|legal|employment)-NNN`);
  } else if (seenIds.has(resource.id)) {
    errors.push(`${label}: duplicate id`);
  } else {
    seenIds.add(resource.id);
  }

  for (const key of ['name', 'description', 'url', 'last_verified']) {
    if (typeof resource[key] !== 'string' || resource[key].trim() === '') {
      errors.push(`${label}: ${key} must be a non-empty string`);
    }
  }

  if (typeof resource.url === 'string') {
    try {
      const url = new URL(resource.url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push(`${label}: url must use http or https`);
      }
    } catch {
      errors.push(`${label}: url must be a valid URL`);
    }
  }

  if (!Array.isArray(resource.provinces) || resource.provinces.length === 0) {
    errors.push(`${label}: provinces must be a non-empty array`);
  } else {
    for (const province of resource.provinces) {
      if (!ALLOWED_PROVINCES.has(province)) {
        errors.push(`${label}: unsupported province "${province}"`);
      }
    }
  }

  if (!Array.isArray(resource.eligible_statuses)) {
    errors.push(`${label}: eligible_statuses must be an array`);
  } else {
    for (const status of resource.eligible_statuses) {
      if (!ALLOWED_STATUSES.has(status)) {
        errors.push(`${label}: unsupported eligible status "${status}"`);
      }
    }
  }

  if (!Array.isArray(resource.categories) || resource.categories.length === 0) {
    errors.push(`${label}: categories must be a non-empty array`);
  } else {
    for (const category of resource.categories) {
      if (!ALLOWED_CATEGORIES.has(category)) {
        errors.push(`${label}: unsupported category "${category}"`);
      }
    }
  }

  if (resource.phone !== null && typeof resource.phone !== 'string') {
    errors.push(`${label}: phone must be a string or null`);
  }

  if (!isValidIsoDate(resource.last_verified)) {
    errors.push(`${label}: last_verified must be a real YYYY-MM-DD date`);
  }

  if (resource.notes !== null && typeof resource.notes !== 'string') {
    errors.push(`${label}: notes must be a string or null`);
  }

  return errors;
}

function main() {
  const errors = [];
  let resources;

  try {
    resources = JSON.parse(readFileSync(resourcesPath, 'utf-8'));
  } catch (error) {
    report([`Could not read or parse ${resourcesPath}: ${error.message}`]);
    return;
  }

  if (!Array.isArray(resources)) {
    report(['resources.json must contain a top-level array']);
    return;
  }

  if (resources.length > 50) {
    errors.push(`resources.json contains ${resources.length} entries; maximum is 50`);
  }

  const seenIds = new Set();
  resources.forEach((resource, index) => {
    errors.push(...validateResource(resource, index, seenIds));
  });

  report(errors);
}

main();
