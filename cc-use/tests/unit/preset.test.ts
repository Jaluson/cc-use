import { describe, it, expect } from 'vitest';
import { getBuiltInPresets, getBuiltInPresetById, loadPreset } from '../../src/core/preset.js';

describe('preset', () => {
  it('should return all built-in presets', () => {
    const presets = getBuiltInPresets();
    expect(presets.length).toBeGreaterThanOrEqual(3);
    expect(presets.some((p) => p.id === 'kimi')).toBe(true);
  });

  it('should find preset by id', () => {
    const preset = getBuiltInPresetById('kimi');
    expect(preset).toBeDefined();
    expect(preset?.label).toBe('Moonshot Kimi');
  });

  it('should return undefined for unknown preset', () => {
    const preset = getBuiltInPresetById('unknown');
    expect(preset).toBeUndefined();
  });

  it('should load preset by id', async () => {
    const preset = await loadPreset('kimi');
    expect(preset).toBeDefined();
    expect(preset?.id).toBe('kimi');
  });
});
