import { describe, expect, test } from 'vitest';

import parseXYZ from './parseXYZ';

describe('Parse XYZ test', () => {
  test('should obtain numberOfAtoms, atoms, coordinates', async () => {
    const result = parseXYZ('./tests/files/BN.xyz');

    expect(result).toHaveProperty('numberOfAtoms');
    expect(result).toHaveProperty('atoms');
    expect(result).toHaveProperty('coordinates');

    expect(result.numberOfAtoms).toEqual(2);
    expect(result.atoms).toEqual(['B', 'N']);
    expect(result.coordinates).toEqual([
      { x: 1.251996, y: 0.722839, z: 4.9959 },
      { x: -0.000001, y: 1.44568, z: 4.9959 }
    ]);
  });
});
