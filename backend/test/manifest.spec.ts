/**
 * The manifest is the platform contract (constitution Article VIII), and this test is what
 * makes Architect's injection CHECKABLE rather than conventional: the committed blank
 * template must validate, and — the forward-compatibility promise — a manifest carrying a
 * field this clone has never heard of must validate too.
 */
import { readFileSync } from 'node:fs';

import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';

const root = (file: string) => new URL(`../../${file}`, import.meta.url);
const manifest = JSON.parse(readFileSync(root('manifest.json'), 'utf8')) as Record<string, unknown>;
const schema = JSON.parse(readFileSync(root('manifest.schema.json'), 'utf8')) as Record<string, unknown>;

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

describe('manifest.json against manifest.schema.json', () => {
  it('the committed blank template validates', () => {
    const valid = validate(manifest);
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('a manifest with an unknown extra key STILL validates — forward compatibility is asserted, not hoped for', () => {
    const future = { ...manifest, addedByALaterPlatform: { anything: true } };
    expect(validate(future)).toBe(true);
  });

  it('carries all eight granted-capability fields', () => {
    const required = (schema as { required: string[] }).required;
    expect([...required].sort()).toEqual(
      ['connections', 'description', 'env', 'icon', 'name', 'playbooks', 'sdk', 'tools'].sort(),
    );
    // sdk.capabilities is the eighth field, nested:
    const sdkSchema = (schema as { properties: { sdk: { required: string[] } } }).properties.sdk;
    expect(sdkSchema.required).toContain('capabilities');
  });

  it('rejects a manifest missing a granted-capability field', () => {
    const { tools: _dropped, ...withoutTools } = manifest;
    expect(validate(withoutTools)).toBe(false);
  });
});

describe('manifest.env and .env.example move together (constitution Article VI §3)', () => {
  it('every variable the manifest expects is documented in .env.example', () => {
    const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
    const documented = new Set(
      example
        .split('\n')
        .filter((line) => /^[A-Z0-9_]+=/.test(line))
        .map((line) => line.split('=')[0]),
    );
    const expected = manifest['env'] as string[];
    // Blank template: [] — vacuously true today, and the REAL assertion the day Architect
    // injects names. The inverse (every example key in the manifest) is deliberately not
    // asserted: the template's own defaults need no grant.
    for (const name of expected) {
      expect(documented.has(name), `${name} is missing from .env.example`).toBe(true);
    }
    // Guard the vacuous case from silently widening: the manifest's env must be an array.
    expect(Array.isArray(expected)).toBe(true);
  });
});
