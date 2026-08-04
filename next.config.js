/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a minimal, self-contained .next/standalone build (only the
  // node_modules files actually needed at runtime) — required for a lean
  // Docker image. Vercel ignores this and uses its own build pipeline.
  output: 'standalone',
  // argon2's native addon is loaded dynamically via node-gyp-build at
  // runtime, not through a static import Next's file tracer can follow, so
  // without this every API route using it (auth, password, MFA) 500s in
  // production with "No native build was found". Same root cause the
  // Dockerfile works around with an explicit COPY of node_modules/argon2.
  // Scoped to /api/** rather than the exact routes — per-route keys
  // ('/api/auth/[...nextauth]/route', etc.) silently failed to match this
  // Next version's internal route naming, while this glob reliably does.
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': ['./node_modules/argon2/prebuilds/linux-x64/**'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
