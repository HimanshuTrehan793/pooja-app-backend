/**
 * Retrieves a required environment variable or throws a clear error.
 * Use this to safely extract env values during startup.
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value;
}
