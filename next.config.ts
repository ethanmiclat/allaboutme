import type { NextConfig } from "next";

/* Content-Security-Policy.

   Deliberately a *static* header rather than the nonce-based approach from
   Next's CSP guide: nonces must be generated per request, which forces dynamic
   rendering and would throw away the static prerender + CDN cache the whole
   site runs on. This page tree has no user input, no auth, and no route
   handlers, so the XSS surface a nonce would buy us is close to nil — the win
   here is constraining *where* scripts, frames, and connections may come from.

   'unsafe-inline' on script-src is required by Next's hydration payload
   (self.__next_f.push) and the pre-paint theme script in layout.tsx; on
   style-src by next/font and the injected <style> in album-impact-carousel. */
const csp = [
  "default-src 'self'",
  // va.vercel-scripts.com = Analytics + Speed Insights; youtube/ytimg = YT IFrame API.
  // 'wasm-unsafe-eval' is for the meshopt/draco WASM decoders drei's useGLTF
  // pulls in for the statue model on /hobbies/sports. It permits WebAssembly
  // compilation only — it does NOT re-enable eval() the way 'unsafe-eval' would.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://va.vercel-scripts.com https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  // covers.openlibrary.org 302s to archive.org, which 302s again to a rotating
  // storage node (ia600505.us.archive.org). CSP is enforced against each redirect
  // target, so every hop in that chain has to be listed.
  "img-src 'self' data: blob: https://image.tmdb.org https://covers.openlibrary.org https://archive.org https://*.archive.org https://i.ytimg.com",
  "media-src 'self' blob: https://audio-ssl.itunes.apple.com",
  "font-src 'self' data:",
  // blob: is required by GLTFLoader, which fetches embedded model textures
  // back out of blob URLs it creates itself.
  "connect-src 'self' blob: https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // The YT IFrame API injects its player iframe.
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Drop the `x-powered-by: Next.js` version banner.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Belt-and-braces with frame-ancestors, for anything that predates CSP.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Preload is safe here: the apex already 308s to www over HTTPS only.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
