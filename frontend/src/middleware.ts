import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory IP rate limiter
// ---------------------------------------------------------------------------
// Limits: 5 requests per 60-second window per IP for submission routes.
// NOTE: In a multi-instance deployment you would use Redis/Upstash here.
// For the MVP a module-level Map is sufficient (single process).

interface RateRecord {
  count: number;
  resetAt: number; // epoch ms
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds

const ipRateMap = new Map<string, RateRecord>();

/**
 * Returns true when the request should be rate-limited (i.e. caller must 429).
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRateMap.get(ip);

  if (!record || now >= record.resetAt) {
    // First request in this window — reset counter
    ipRateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;

  if (record.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

/**
 * Extract caller IP from standard headers.
 * x-forwarded-for is set by Vercel / most reverse proxies.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first address
    return forwarded.split(',')[0].trim();
  }
  // Fallback — Next.js exposes this on the request in some environments
  return (request as any).ip ?? 'unknown';
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // --- Rate limiting: apply only to submission routes ---
  const isSubmitRoute =
    pathname === '/submit' ||
    pathname.startsWith('/api/submit') ||
    pathname.startsWith('/actions/submitConcern');

  if (isSubmitRoute) {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please wait a moment before trying again.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // --- Auth pass-through ---
  // custom_access_token and legacy Supabase sessions are handled entirely on
  // the server-client level (createClient in lib/supabase/server.ts reads
  // cookies). No token inspection is required in middleware for the MVP — we
  // simply forward every request and let the server actions validate auth.

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Route matcher — keep the middleware lightweight by only running on HTML
// pages and API routes (skip static assets, images, _next internals).
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimization)
     *  - favicon.ico
     *  - public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
