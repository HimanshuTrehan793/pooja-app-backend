export function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value;
}
