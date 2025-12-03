/**
 * Rate limiting utility for API routes
 * Uses in-memory store for development, can be extended to use Redis in production
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for development/single-instance)
// In production with multiple instances, use Redis or similar
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 5 * 60 * 1000);

function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (for production behind proxy)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  
  // In development, use a more permissive identifier
  if (process.env.NODE_ENV === "development") {
    return "dev-client";
  }
  
  return ip;
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = getClientIdentifier,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return async (
    req: Request,
    handler: (req: Request) => Promise<Response>
  ): Promise<Response> => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create entry
    let entry = store[key];
    
    if (!entry || entry.resetTime < now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      store[key] = entry;
    }
    
    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(entry.resetTime),
          },
        }
      );
    }
    
    // Increment counter before request
    entry.count++;
    
    // Execute handler
    const response = await handler(req);
    
    // Decrement if we should skip this request type
    if (
      (skipSuccessfulRequests && response.status < 400) ||
      (skipFailedRequests && response.status >= 400)
    ) {
      entry.count = Math.max(0, entry.count - 1);
    }
    
    // Add rate limit headers to response
    const remaining = Math.max(0, maxRequests - entry.count);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Limit", String(maxRequests));
    newHeaders.set("X-RateLimit-Remaining", String(remaining));
    newHeaders.set("X-RateLimit-Reset", String(entry.resetTime));
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Strict rate limit for authentication/admin endpoints
  strict: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
  }),
  
  // Standard rate limit for cart operations
  cart: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  }),
  
  // Moderate rate limit for checkout
  checkout: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
  }),
  
  // Standard rate limit for general API endpoints
  standard: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }),
  
  // Lenient rate limit for read operations
  read: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),
  
  // Upload rate limit (stricter)
  upload: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  }),
};


