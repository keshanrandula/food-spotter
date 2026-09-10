/**
 * Secure Environment & Secrets Configuration Manager
 * 
 * Implements:
 * - Immutable typed configuration data structure
 * - O(1) memoized lookup with validation algorithm
 * - Sanitization (whitespace, quotes, placeholders)
 * - Safe secret masking algorithm for diagnostic logs
 * - Client/Server boundary enforcement (prevents secret leaks to browser)
 */

export interface ServerConfig {
  mongodbUri: string | null;
  openrouterApiKey: string | null;
  openrouterModel: string;
  openrouterVisionModel: string;
  googlePlacesApiKey: string | null;
  geoapifyApiKey: string | null;
  backendUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Secret Masking Algorithm (Masks 70% of the secret for safe logging)
 */
export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '(not set)';
  const str = String(secret).trim();
  if (str.length <= 8) return '********';
  
  // For MongoDB URI: mask username/password part
  if (str.includes('://') && str.includes('@')) {
    return str.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:********@');
  }
  
  const visiblePrefix = str.slice(0, 6);
  const visibleSuffix = str.slice(-4);
  return `${visiblePrefix}****...****${visibleSuffix}`;
}

/**
 * Sanitization Algorithm: Trims whitespace, removes wrapping quotes, detects dummy placeholders
 */
function sanitizeEnv(value: string | undefined, placeholderPatterns: string[] = []): string | null {
  if (!value) return null;
  let clean = value.trim();

  // Strip wrapping single or double quotes
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }

  if (!clean || clean.length === 0) return null;

  // Check against common dummy/placeholder values
  const lower = clean.toLowerCase();
  const isPlaceholder = placeholderPatterns.some(p => lower.includes(p.toLowerCase())) ||
    lower.startsWith('your_') ||
    lower.includes('placeholder') ||
    lower === 'xxx';

  if (isPlaceholder) {
    return null;
  }

  return clean;
}

/**
 * Validates MongoDB URI structure
 */
function validateMongoUri(uri: string | null): string | null {
  if (!uri) return null;
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn('⚠️ [Config] Invalid MONGODB_URI scheme. Expected mongodb:// or mongodb+srv://');
    return null;
  }
  return uri;
}

/**
 * Validates OpenRouter API Key
 */
function validateOpenRouterKey(key: string | null): string | null {
  if (!key) return null;
  if (!key.startsWith('sk-or-')) {
    console.warn('⚠️ [Config] OpenRouter API key usually starts with "sk-or-". Proceeding with caution.');
  }
  return key;
}

/**
 * Build and memoize configuration singleton
 */
class EnvironmentManager {
  private static instance: EnvironmentManager;
  private readonly config: ServerConfig;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';

    // Prevent secret loading on client bundle
    if (this.isClient) {
      this.config = {
        mongodbUri: null,
        openrouterApiKey: null,
        openrouterModel: 'meta-llama/llama-3-8b-instruct:free',
        openrouterVisionModel: 'google/gemini-flash-1.5',
        googlePlacesApiKey: null,
        geoapifyApiKey: null,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api',
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV !== 'production',
      };
      return;
    }

    // Server-side secure parsing & validation
    const rawMongo = sanitizeEnv(process.env.MONGODB_URI, ['your_mongodb', 'example']);
    const rawOpenRouter = sanitizeEnv(process.env.OPENROUTER_API_KEY, ['your_openrouter', 'your_key']);
    const rawGoogle = sanitizeEnv(process.env.GOOGLE_PLACES_API_KEY, ['your_google', 'your_key']);
    const rawGeoapify = sanitizeEnv(process.env.GEOAPIFY_API_KEY, ['your_geoapify', 'your_key']);
    
    this.config = Object.freeze({
      mongodbUri: validateMongoUri(rawMongo),
      openrouterApiKey: validateOpenRouterKey(rawOpenRouter),
      openrouterModel: sanitizeEnv(process.env.OPENROUTER_MODEL) || 'meta-llama/llama-3-8b-instruct:free',
      openrouterVisionModel: sanitizeEnv(process.env.OPENROUTER_VISION_MODEL) || 'google/gemini-flash-1.5',
      googlePlacesApiKey: rawGoogle,
      geoapifyApiKey: rawGeoapify,
      backendUrl: sanitizeEnv(process.env.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:5000/api',
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV !== 'production',
    });

    this.logDiagnosticSummary();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public get(): Readonly<ServerConfig> {
    return this.config;
  }

  private logDiagnosticSummary(): void {
    if (this.isClient || this.config.isProduction) return;

    console.log('\n🔒 --- [Secure Config Initialized] ---');
    console.log(`• MongoDB URI:         ${this.config.mongodbUri ? '✅ Configured (' + maskSecret(this.config.mongodbUri) + ')' : '⚠️ Not set (Using fallback memory mode)'}`);
    console.log(`• OpenRouter AI Key:   ${this.config.openrouterApiKey ? '✅ Configured (' + maskSecret(this.config.openrouterApiKey) + ')' : '⚠️ Not set (Using deterministic NLP offline engine)'}`);
    console.log(`• OpenRouter Model:    ${this.config.openrouterModel}`);
    console.log(`• Google Places API:   ${this.config.googlePlacesApiKey ? '✅ Configured (' + maskSecret(this.config.googlePlacesApiKey) + ')' : 'ℹ️ Not set (Using OSM / Geoapify places)'}`);
    console.log(`• Geoapify API Key:    ${this.config.geoapifyApiKey ? '✅ Configured (' + maskSecret(this.config.geoapifyApiKey) + ')' : 'ℹ️ Not set (Using OSM Overpass)'}`);
    console.log('-------------------------------------\n');
  }
}

export const serverConfig = EnvironmentManager.getInstance().get();
export const getEnv = () => EnvironmentManager.getInstance().get();
