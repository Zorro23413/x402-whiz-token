import { NextRequest, NextResponse } from "next/server";
import { paymentMiddleware } from "x402-next";
import { Coinbase } from "@coinbase/cdp-sdk";
import { env } from "./lib/env";
import { getOrCreateSellerAccount } from "./lib/accounts";

const network = env.NETWORK;
const sellerAccount = await getOrCreateSellerAccount();

console.log("=== X402 Middleware Configuration ===");
console.log("Network:", network);
console.log("Seller Account:", sellerAccount.address);

// Create CDP facilitator config manually to avoid @coinbase/x402 package issues
// The @coinbase/x402 package fails in Vercel due to import issues
const COINBASE_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";

// Function to generate CDP JWT auth headers
async function createCdpAuthHeaders() {
  try {
    const apiKeyId = env.CDP_API_KEY_ID;
    const apiKeySecret = env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      console.error("Missing CDP API keys");
      return {};
    }

    // Use CDP SDK to generate JWT for authentication
    const { generateJwt } = await import("@coinbase/cdp-sdk/auth");
    const requestHost = "api.cdp.coinbase.com";

    return {
      verify: {
        Authorization: `Bearer ${await generateJwt({
          apiKeyId,
          apiKeySecret,
          requestMethod: "POST",
          requestHost,
          requestPath: "/platform/v2/x402/verify"
        })}`
      },
      settle: {
        Authorization: `Bearer ${await generateJwt({
          apiKeyId,
          apiKeySecret,
          requestMethod: "POST",
          requestHost,
          requestPath: "/platform/v2/x402/settle"
        })}`
      }
    };
  } catch (error) {
    console.error("Failed to create CDP auth headers:", error);
    return {};
  }
}

const facilitatorConfig = {
  url: COINBASE_FACILITATOR_URL,
  createAuthHeaders: createCdpAuthHeaders
};

export const x402Middleware = paymentMiddleware(
  sellerAccount.address,
  {
    // pages
    "/blog": {
      price: "$0.001",
      network,
      config: {
        description: "Access to protected content",
      },
    },
    // api routes
    "/api/add": {
      price: "$0.005",
      network,
      config: {
        description: "Access to protected content",
      },
    },
    "/api/mint": {
      price: "$0.10",
      network,
      config: {
        description: "Mint 100 Whiz402 tokens",
      },
    },
  },
  facilitatorConfig // Use CDP facilitator with manual auth
);

export default async function middleware(request: NextRequest) {
  // run middleware for all api routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return x402Middleware(request);
  } else {
    // for normal pages, only run middleware if it's a bot
    const isScraper = checkIsScraper(request);
    if (isScraper) {
      return x402Middleware(request);
    } else {
      return NextResponse.next();
    }
  }
}

function checkIsScraper(request: NextRequest) {
  const scraperRegex =
    /Bot|AI2Bot|Ai2Bot-Dolma|aiHitBot|Amazonbot|anthropic-ai|Applebot|Applebot-Extended|Brightbot 1.0|Bytespider|CCBot|ChatGPT-User|Claude-Web|ClaudeBot|cohere-ai|cohere-training-data-crawler|Cotoyogi|Crawlspace|Diffbot|DuckAssistBot|FacebookBot|Factset_spyderbot|FirecrawlAgent|FriendlyCrawler|Google-Extended|GoogleOther|GoogleOther-Image|GoogleOther-Video|GPTBot|iaskspider\/2.0|ICC-Crawler|ImagesiftBot|img2dataset|ISSCyberRiskCrawler|Kangaroo Bot|meta-externalagent|Meta-ExternalAgent|meta-externalfetcher|Meta-ExternalFetcher|NovaAct|OAI-SearchBot|omgili|omgilibot|Operator|PanguBot|Perplexity-User|PerplexityBot|PetalBot|Scrapy|SemrushBot-OCOB|SemrushBot-SWA|Sidetrade indexer bot|TikTokSpider|Timpibot|VelenPublicWebCrawler|Webzio-Extended|YouBot/i;

  const userAgent = request.headers.get("user-agent");
  const botUserAgent = scraperRegex.test(userAgent ?? "");

  const manualBot = request.nextUrl.searchParams.get("bot") === "true";

  return botUserAgent || manualBot;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
  runtime: "nodejs",
};
