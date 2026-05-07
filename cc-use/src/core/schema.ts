import type { Profile, Preset } from './types.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateProfile(profile: unknown, preset?: Preset): ValidationResult {
  const errors: ValidationError[] = [];

  if (!profile || typeof profile !== 'object') {
    errors.push({ field: '', message: 'Profile must be an object' });
    return { valid: false, errors };
  }

  const p = profile as Record<string, unknown>;

  if (typeof p.version !== 'number' || p.version !== 1) {
    errors.push({ field: 'version', message: 'version must be 1' });
  }

  if (typeof p.preset !== 'string' || p.preset.length === 0) {
    errors.push({ field: 'preset', message: 'preset must be a non-empty string' });
  }

  if (typeof p.label !== 'string' || p.label.length === 0) {
    errors.push({ field: 'label', message: 'label must be a non-empty string' });
  }

  if (typeof p.presetVersion !== 'number') {
    errors.push({ field: 'presetVersion', message: 'presetVersion must be a number' });
  }

  if (!p.env || typeof p.env !== 'object' || Array.isArray(p.env)) {
    errors.push({ field: 'env', message: 'env must be an object' });
  } else {
    for (const [key, value] of Object.entries(p.env as Record<string, unknown>)) {
      if (typeof value !== 'string') {
        errors.push({ field: `env.${key}`, message: 'env values must be strings' });
      }
    }
  }

  if (preset) {
    const env = (p.env as Record<string, string>) || {};
    for (const [key, template] of Object.entries(preset.env)) {
      if (!template.value && !env[key]) {
        errors.push({ field: `env.${key}`, message: `${key} is required` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePreset(preset: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!preset || typeof preset !== 'object') {
    errors.push({ field: '', message: 'Preset must be an object' });
    return { valid: false, errors };
  }

  const p = preset as Record<string, unknown>;

  if (typeof p.version !== 'number' || p.version !== 1) {
    errors.push({ field: 'version', message: 'version must be 1' });
  }

  if (typeof p.id !== 'string' || p.id.length === 0) {
    errors.push({ field: 'id', message: 'id must be a non-empty string' });
  }

  if (typeof p.label !== 'string' || p.label.length === 0) {
    errors.push({ field: 'label', message: 'label must be a non-empty string' });
  }

  if (!p.capabilities || typeof p.capabilities !== 'object') {
    errors.push({ field: 'capabilities', message: 'capabilities must be an object' });
  }

  if (!Array.isArray(p.modelRoles)) {
    errors.push({ field: 'modelRoles', message: 'modelRoles must be an array' });
  }

  if (!p.modelEnvMapping || typeof p.modelEnvMapping !== 'object') {
    errors.push({ field: 'modelEnvMapping', message: 'modelEnvMapping must be an object' });
  }

  if (!p.env || typeof p.env !== 'object') {
    errors.push({ field: 'env', message: 'env must be an object' });
  }

  return { valid: errors.length === 0, errors };
}
