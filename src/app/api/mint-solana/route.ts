import { NextRequest, NextResponse } from "next/server";
import { mintSPLTokens, getSolanaExplorerUrl, getNetwork } from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";
import z from "zod";

/**
 * POST /api/mint-solana
 *
 * Mints 50,000 SPL tokens to the specified Solana address
 * Protected by X402 payment middleware ($0.10 USDC per mint)
 */
export const POST = async (request: NextRequest) => {
  try {
    // Parse request body
    const body = await request.json();
    const schema = z.object({
      address: z.string().refine((addr) => {
        try {
          new PublicKey(addr);
          return true;
        } catch {
          return false;
        }
      }, {
        message: "Invalid Solana address",
      }),
    });

    const parseResult = schema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { address } = parseResult.data;

    // Mint 50,000 tokens
    const result = await mintSPLTokens(address, 50_000);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Minting failed",
          details: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully minted ${result.amount} tokens`,
      signature: result.signature,
      recipient: result.recipient,
      amount: result.amount,
      explorerUrl: getSolanaExplorerUrl(result.signature!, getNetwork()),
    });

  } catch (error) {
    console.error("Solana Mint API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};

/**
 * GET /api/mint-solana
 *
 * Returns information about the Solana minting endpoint
 */
export const GET = async () => {
  const tokenMint = process.env.SOLANA_TOKEN_MINT;
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

  return NextResponse.json({
    endpoint: "/api/mint-solana",
    method: "POST",
    description: "Mint 50,000 SPL tokens to any Solana address",
    payment: {
      price: "$0.10",
      protocol: "x402",
    },
    tokenMint: tokenMint || "Not configured",
    network,
    request: {
      body: {
        address: "SolanaAddressHere... (Solana address to receive tokens)",
      },
    },
    example: {
      curl: `curl -X POST https://yourdomain.com/api/mint-solana \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"address":"YourSolanaAddressHere..."}'`,
    },
  });
};
