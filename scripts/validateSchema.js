#!/usr/bin/env node

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

const VALID_STATUSES = new Set([
  'refugee_claimant',
  'permanent_resident',
  'study_work_permit',
  'other',
]);

const VALID_CATEGORIES = new Set(['housing', 'legal_aid', 'employment']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PROVINCE_RE = /^[A-Z]{2}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function add(errors, index, id, message) {
  errors.push(`Resource ${index + 1}${id ? ` (${id})` : ''}: ${message}`);
}

function validateResource(resource, index, seenIds, errors) {
  const id = typeof resource?.id === 'string' ? resource.id : null;

  for (const key of REQUIRED_KEYS) {
    if (!Object.hasOwn(resource, key)) {
      add(errors, index, id, `missing required key "${key}"`);
    }
  }

  if (!isNonEmptyString(resource.id)) {
    add(errors, index, id, 'id must be a non-empty string');
  } else if (seenIds.has(resource.id)) {
    add(errors, index, id, 'id must be unique');
  } else {
    seenIds.add(resource.id);
  }

  for (const key of ['name', 'description', 'url', 'last_verified']) {
    if (!isNonEmptyString(resource[key])) {
      add(errors, index, id, `${key} must be a non-empty string`);
    }
  }

  if (isNonEmptyString(resource.url)) {
    try {
      const url = new URL(resource.url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        add(errors, index, id, 'url must use http or https');
      }
    } catch {
      add(errors, index, id, 'url must be a valid URL');
    }
  }

  if (resource.phone !== null && typeof resource.phone !== 'string') {
    add(errors, index, id, 'phone must be a string or null');
  }

  if (resource.notes !== null && typeof resource.notes !== 'string') {
    add(errors, index, id, 'notes must be a string or null');
  }

  if (!DATE_RE.test(resource.last_verified || '')) {
    add(errors, index, id, 'last_verified must use YYYY-MM-DD format');
  } else if (Number.isNaN(Date.parse(`${resource.last_verified}T12:00:00Z`))) {
    add(errors, index, id, 'last_verified must be a real calendar date');
  }

  if (!Array.isArray(resource.provinces) || resource.provinces.length === 0) {
    add(errors, index, id, 'provinces must be a non-empty array');
  } else {
    for (const province of resource.provinces) {
      if (!PROVINCE_RE.test(province)) {
        add(errors, index, id, `invalid province code "${province}"`);
      }
    }
  }

  if (!Array.isArray(resource.eligible_statuses)) {
    add(errors, index, id, 'eligible_statuses must be an array');
  } else {
    for (const status of resource.eligible_statuses) {
      if (!VALID_STATUSES.has(status)) {
        add(errors, index, id, `invalid eligible status "${status}"`);
      }
    }
  }

  if (!Array.isArray(resource.categories) || resource.categories.length === 0) {
    add(errors, index, id, 'categories must be a non-empty array');
  } else {
    for (const category of resource.categories) {
      if (!VALID_CATEGORIES.has(category)) {
        add(errors, index, id, `invalid category "${category}"`);
      }
    }
  }
}

function main() {
  const errors = [];
  let resources;

  try {
    resources = JSON.parse(readFileSync(resourcesPath, 'utf8'));
  } catch (error) {
    console.error(`Could not read or parse ${resourcesPath}`);
    console.error(error.message);
    process.exit(1);
  }

  if (!Array.isArray(resources)) {
    console.error('resources.json must contain a top-level array.');
    process.exit(1);
  }

  const seenIds = new Set();
  resources.forEach((resource, index) => {
    validateResource(resource, index, seenIds, errors);
  });

  if (errors.length > 0) {
    console.error(`Resource schema validation failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Resource schema validation passed for ${resources.length} resources.`);
}

main();
