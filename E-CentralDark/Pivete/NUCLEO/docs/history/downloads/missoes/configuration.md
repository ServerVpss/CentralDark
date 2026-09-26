# R2 Configuration

## Workers Binding

**wrangler.jsonc:**
```jsonc
{
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket-name"
    }
  ]
}
```

## TypeScript Types

```typescript
interface Env { MY_BUCKET: R2Bucket; }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const object = await env.MY_BUCKET.get('file.txt');
    return new Response(object?.body);
  }
}
```

## S3 SDK Setup

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: [REDIGIDO-PRESERVACAO]
  }
});

await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'file.txt',
  Body: data,
  StorageClass: 'STANDARD' // or 'STANDARD_IA'
}));
```

## Location Hints

```bash
wrangler r2 bucket create my-bucket --location=enam

# Hints: wnam, enam, weur, eeur, apac, oc
# Jurisdictions (override hint): --jurisdiction=eu (or fedramp)
```

## CORS Configuration

CORS must be configured via S3 SDK or dashboard (not available in Workers API):

```typescript
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: [REDIGIDO-PRESERVACAO]
  }
});

await s3.send(new PutBucketCorsCommand({
  Bucket: 'my-bucket',
  CORSConfiguration: {
    CORSRules: [{
      AllowedOrigins: ['https://example.com'],
      AllowedMethods: ['GET', 'PUT', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600
    }]
  }
}));
```

## Object Lifecycles

```typescript
import { PutBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';

await s3.send(new PutBucketLifecycleConfigurationCommand({
  Bucket: 'my-bucket',
  LifecycleConfiguration: {
    Rules: [
      {
        ID: 'expire-old-logs',
        Status: 'Enabled',
        Prefix: 'logs/',
        Expiration: { Days: 90 }
      },
      {
        ID: 'transition-to-ia',
        Status: 'Enabled',
        Prefix: 'archives/',
        Transitions: [{ Days: 30, StorageClass: 'STANDARD_IA' }]
      }
    ]
  }
}));
```

## API Token Scopes

When creating R2 tokens, set minimal permissions:

| Permission | Use Case |
|------------|----------|
| Object Read | Public serving, downloads |
| Object Write | Uploads only |
| Object Read & Write | Full object operations |
| Admin Read & Write | Bucket management, CORS, lifecycles |

**Best practice:** Separate tokens for Workers (read/write) vs admin tasks (CORS, lifecycles).

## Event Notifications

```jsonc
// wrangler.jsonc
{
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket",
      "event_notifications": [
        {
          "queue": "r2-events",
          "actions": ["PutObject", "DeleteObject", "CompleteMultipartUpload"]
        }
      ]
    }
  ],
  "queues": {
    "producers": [{ "binding": "R2_EVENTS", "queue": "r2-events" }],
    "consumers": [{ "queue": "r2-events", "max_batch_size": 10 }]
  }
}
```

## Bucket Management

```bash
wrangler r2 bucket create my-bucket --location=enam --storage-class=Standard
wrangler r2 bucket list
wrangler r2 bucket info my-bucket
wrangler r2 bucket delete my-bucket  # Must be empty
wrangler r2 bucket update-storage-class my-bucket --storage-class=InfrequentAccess

# Public bucket via dashboard
wrangler r2 bucket domain add my-bucket --domain=files.example.com
```
'@cloudflare/realtimekit';

const uiConfig: UIConfig = {
  designTokens: {
    colors: {
      brand: { 500: '#0066ff', 600: '#0052cc' },
      background: { 1000: '#1A1A1A', 900: '#2D2D2D' },
      text: { 1000: '#FFFFFF', 900: '#E0E0E0' }
    },
    borderRadius: 'extra-rounded',  // 'rounded' | 'extra-rounded' | 'sharp'
    theme: 'dark'  // 'light' | 'dark'
  },
  logo: { url: 'https://example.com/logo.png', altText: 'Company' }
};

// Apply to React
<RtkMeeting authToken={token} config={uiConfig} onLeave={() => {}} />

// Or use CSS variables
// :root { --rtk-color-brand-500: #0066ff; --rtk-border-radius: 12px; }
```

## Internationalization (i18n)

### Custom Language Strings
```typescript
import { useLanguage } from '@cloudflare/realtimekit-ui';

const customLanguage = {
  'join': 'Entrar',
  'leave': 'Salir',
  'mute': 'Silenciar',
  'unmute': 'Activar audio',
  'turn_on_camera': 'Encender cámara',
  'turn_off_camera': 'Apagar cámara',
  'share_screen': 'Compartir pantalla',
  'stop_sharing': 'Dejar de compartir'
};

const t = useLanguage(customLanguage);

// React usage
<RtkMeeting authToken={token} t={t} onLeave={() => {}} />
```

### Supported Locales
Default locales available: `en`, `es`, `fr`, `de`, `pt`, `ja`, `zh`

```typescript
import { setLocale } from '@cloudflare/realtimekit-ui';
setLocale('es');  // Switch to Spanish
```

## See Also

- [API](./api.md) - Meeting APIs, REST endpoints
- [Patterns](./patterns.md) - Backend integration examples
- [README](./README.md) - Overview and quick start
