export interface SavedConfiguration {
  id: string;
  name: string;
  startUrl: string;
  objective: string;
  runMethod: 'run' | 'runAndWait' | 'runStepByStep';
  code: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'agp-sdk-configurations';

export function getSavedConfigurations(): SavedConfiguration[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load configurations:', error);
    return [];
  }
}

export function saveConfiguration(
  config: Omit<SavedConfiguration, 'id' | 'createdAt' | 'updatedAt'>
): SavedConfiguration {
  const configurations = getSavedConfigurations();

  const newConfig: SavedConfiguration = {
    ...config,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  configurations.push(newConfig);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configurations));

  return newConfig;
}

export function updateConfiguration(
  id: string,
  updates: Partial<Omit<SavedConfiguration, 'id' | 'createdAt'>>
): SavedConfiguration | null {
  const configurations = getSavedConfigurations();
  const index = configurations.findIndex((c) => c.id === id);

  if (index === -1) return null;

  configurations[index] = {
    ...configurations[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(configurations));
  return configurations[index];
}

export function deleteConfiguration(id: string): boolean {
  const configurations = getSavedConfigurations();
  const filtered = configurations.filter((c) => c.id !== id);

  if (filtered.length === configurations.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
