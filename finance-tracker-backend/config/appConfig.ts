import fs from 'fs';
import path from 'path';

export type AppProfile = 'DEV' | 'PRE-PROD' | 'PROD';

type SameSiteMode = 'lax' | 'strict' | 'none';

type ProfileConfig = {
  server: {
    port: number;
    jsonBodyLimit: string;
    shutdownTimeoutMs: number;
    cors: {
      credentials: boolean;
      allowedOrigins: string[];
    };
    helmet: {
      contentSecurityPolicy: {
        defaultSrc: string[];
        scriptSrc: string[];
        styleSrc: string[];
        imgSrc: string[];
        connectSrc: string[];
      };
    };
  };
  auth: {
    jwt: {
      cookieName: string;
      expiresIn: `${number}${'m' | 'h' | 'd'}`;
      maxAgeMs: number;
      algorithm: 'HS256';
      httpOnly: boolean;
      secure: boolean;
      sameSite: SameSiteMode;
      path: string;
    };
  };
  rateLimit: {
    memoryCleanupWindowMs: number;
    memoryCleanupIntervalMs: number;
    redisExpiryBufferSeconds: number;
    auth: {
      scope: string;
      maxHits: number;
      windowMs: number;
      message: string;
    };
    api: {
      scope: string;
      maxHits: number;
      windowMs: number;
      message: string;
    };
  };
  redis: {
    reconnectMaxRetries: number;
    reconnectBaseDelayMs: number;
    reconnectMaxDelayMs: number;
  };
  scheduler: {
    enabled: boolean;
    cron: string;
    budgetAlertCacheTtlSeconds: number;
  };
  cache: {
    ttl: {
      short: number;
      medium: number;
      long: number;
      bills: number;
      billInstances: number;
    };
  };
  logger: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
};

type ConfigMap = Record<AppProfile, ProfileConfig>;

const configPathCandidates = [
  path.resolve(__dirname, 'appProfiles.json'),
  path.resolve(process.cwd(), 'config', 'appProfiles.json'),
  path.resolve(process.cwd(), 'dist', 'config', 'appProfiles.json'),
];

const configPath = configPathCandidates.find((candidate) => fs.existsSync(candidate));
if (!configPath) {
  throw new Error(`FATAL: appProfiles.json not found. Checked: ${configPathCandidates.join(', ')}`);
}

const raw = fs.readFileSync(configPath, 'utf-8');
const configMap = JSON.parse(raw) as ConfigMap;

function substituteEnv(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (_, envName: string) => process.env[envName] ?? '');
}

function resolveProfileConfig(input: ProfileConfig): ProfileConfig {
  return {
    ...input,
    server: {
      ...input.server,
      port: Number(process.env.PORT || input.server.port),
      cors: {
        ...input.server.cors,
        allowedOrigins: input.server.cors.allowedOrigins
          .map(substituteEnv)
          .filter(Boolean),
      },
      helmet: {
        ...input.server.helmet,
        contentSecurityPolicy: {
          ...input.server.helmet.contentSecurityPolicy,
          connectSrc: [
            ...input.server.helmet.contentSecurityPolicy.connectSrc,
            ...input.server.cors.allowedOrigins.map(substituteEnv).filter(Boolean),
          ],
        },
      },
    },
  };
}

const selectedProfile = ((process.env.APP_PROFILE || 'DEV').toUpperCase()) as AppProfile;

if (!configMap[selectedProfile]) {
  throw new Error(`Invalid APP_PROFILE: ${process.env.APP_PROFILE}. Expected DEV, PRE-PROD, or PROD.`);
}

export const APP_PROFILE: AppProfile = selectedProfile;
export const appConfig: ProfileConfig = resolveProfileConfig(configMap[selectedProfile]);
