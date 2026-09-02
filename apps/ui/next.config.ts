import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // WebContainer needs cross-origin isolation for SharedArrayBuffer.
        //
        // `credentialless` rather than `require-corp`: under require-corp every
        // cross-origin subresource must send CORP headers, which Clerk's scripts
        // and avatar images do not — they were silently blocked inside the IDE.
        // credentialless still enables SharedArrayBuffer, but loads no-CORS
        // subresources without credentials instead of refusing them.
        source: "/room/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  devIndicators: false,
};

export default nextConfig;
