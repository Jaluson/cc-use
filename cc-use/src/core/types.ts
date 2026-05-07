// src/core/types.ts

export interface EnvVariableTemplate {
  value: string;
  description?: string;
  secret?: boolean;
}

export interface ModelDiscoveryConfig {
  endpoint: string;
  responsePath?: string;
  idField?: string;
}

export interface Preset {
  version: number;
  id: string;
  label: string;
  capabilities: Record<string, boolean>;
  modelDiscovery?: ModelDiscoveryConfig;
  recommendedModels?: string[];
  modelRoles: string[];
  modelEnvMapping: Record<string, string>;
  env: Record<string, EnvVariableTemplate>;
  providerRuntimeSettings?: Record<string, unknown>;
  configFileName?: string;
}

export interface Profile {
  version: number;
  preset: string;
  presetVersion: number;
  label: string;
  env: Record<string, string>;
  configFileName?: string;
}

export interface Metadata {
  version: number;
  profile: string;
  preset: string;
  presetVersion: number;
  updatedAt: string;
  profileChecksum: string;
  lastManagedEnvKeys: string[];
  configFileName: string;
  hasOriginalBackup?: boolean;
}

export interface SettingsJson {
  env?: Record<string, string>;
  [key: string]: unknown;
}

export interface ConfigPaths {
  home: string;
  profiles: string;
  presets: string;
  config: string;
}

export type ValidateLevel = 'local' | 'online' | 'discovery';
