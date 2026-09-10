import dotenv from 'dotenv';
dotenv.config();

export interface BackendConfig {
  port: number;
  mongodbUri: string | null;
  openrouterApiKey: string | null;
  openrouterModel: string;
  googlePlacesApiKey: string | null;
  geoapifyApiKey: string | null;
  isProduction: boolean;
}

export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '(not set)';
  const str = String(secret).trim();
  if (str.length <= 8) return '********';

  if (str.includes('://') && str.includes('@')) {
    return str.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:********@');
  }

  const visiblePrefix = str.slice(0, 6);
  const visibleSuffix = str.slice(-4);
  return `${visiblePrefix}****...****${visibleSuffix}`;
}

function sanitizeEnv(value: string | undefined, placeholderPatterns: string[] = []): string | null {
  if (!value) return null;
  let clean = value.trim();

  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }

  if (!clean || clean.length === 0) return null;

  const lower = clean.toLowerCase();
  const isPlaceholder = placeholderPatterns.some(p => lower.includes(p.toLowerCase())) ||
    lower.startsWith('your_') ||
    lower.includes('placeholder') ||
    lower === 'xxx';

  if (isPlaceholder) return null;
  return clean;
}

function validateMongoUri(uri: string | null): string | null {
  if (!uri) return null;
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn('⚠️ [Backend Config] Invalid MONGODB_URI scheme. Expected mongodb:// or mongodb+srv://');
    return null;
  }
  return uri;
}

class BackendEnvManager {
  private static instance: BackendEnvManager;
  private readonly config: BackendConfig;

  private constructor() {
    const rawPort = parseInt(process.env.PORT || '5000', 10);
    const rawMongo = sanitizeEnv(process.env.MONGODB_URI, ['your_mongodb', 'example']);
    const rawOpenRouter = sanitizeEnv(process.env.OPENROUTER_API_KEY, ['your_openrouter', 'your_key']);
    const rawGoogle = sanitizeEnv(process.env.GOOGLE_PLACES_API_KEY, ['your_google', 'your_key']);
    const rawGeoapify = sanitizeEnv(process.env.GEOAPIFY_API_KEY, ['your_geoapify', 'your_key']);

    this.config = Object.freeze({
      port: isNaN(rawPort) ? 5000 : rawPort,
      mongodbUri: validateMongoUri(rawMongo),
      openrouterApiKey: rawOpenRouter,
      openrouterModel: sanitizeEnv(process.env.OPENROUTER_MODEL) || 'meta-llama/llama-3-8b-instruct:free',
      googlePlacesApiKey: rawGoogle,
      geoapifyApiKey: rawGeoapify,
      isProduction: process.env.NODE_ENV === 'production',
    });

    this.logDiagnosticSummary();
  }

  public static getInstance(): BackendEnvManager {
    if (!BackendEnvManager.instance) {
      BackendEnvManager.instance = new BackendEnvManager();
    }
    return BackendEnvManager.instance;
  }

  public get(): Readonly<BackendConfig> {
    return this.config;
  }

  private logDiagnosticSummary(): void {
    if (this.config.isProduction) return;

    console.log('\n🔒 --- [Backend Secure Config Initialized] ---');
    console.log(`• Port:                ${this.config.port}`);
    console.log(`• MongoDB URI:         ${this.config.mongodbUri ? '✅ Configured (' + maskSecret(this.config.mongodbUri) + ')' : '⚠️ Not set (Memory fallback)'}`);
    console.log(`• OpenRouter AI Key:   ${this.config.openrouterApiKey ? '✅ Configured (' + maskSecret(this.config.openrouterApiKey) + ')' : '⚠️ Not set'}`);
    console.log(`• OpenRouter Model:    ${this.config.openrouterModel}`);
    console.log(`• Geoapify Key:        ${this.config.geoapifyApiKey ? '✅ Configured (' + maskSecret(this.config.geoapifyApiKey) + ')' : 'ℹ️ Not set'}`);
    console.log('---------------------------------------------\n');
  }
}

export const backendConfig = BackendEnvManager.getInstance().get();
export const getBackendEnv = () => BackendEnvManager.getInstance().get();
