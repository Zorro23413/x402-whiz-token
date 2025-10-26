import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSellerAccount } from "@/lib/accounts";
import { mintTokens } from "@/lib/token";
import { isAddress } from "viem";
import z from "zod";

/**
 * POST /api/mint
 *
 * Mints 100 tokens to the specified address
 * Protected by X402 payment middleware ($1.00 per mint)
 */
export const POST = async (request: NextRequest) => {
  try {
    // Get the token contract address from environment
    const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;

    if (!tokenContractAddress) {
      return NextResponse.json(
        {
          error: "Token contract not configured. Please deploy the contract and set TOKEN_CONTRACT_ADDRESS in .env.local"
        },
        { status: 500 }
      );
    }

    if (!isAddress(tokenContractAddress)) {
      return NextResponse.json(
        { error: "Invalid token contract address" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const schema = z.object({
      address: z.string().refine(isAddress, {
        message: "Invalid Ethereum address",
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

    // Get seller account to perform the mint
    const sellerAccount = await getOrCreateSellerAccount();

    // Mint tokens
    const result = await mintTokens(
      tokenContractAddress as `0x${string}`,
      address as `0x${string}`,
      sellerAccount
    );

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
      transactionHash: result.transactionHash,
      recipient: result.recipient,
      amount: result.amount,
      explorerUrl: getExplorerUrl(result.transactionHash!),
    });

  } catch (error) {
    console.error("Mint API error:", error);
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
 * GET /api/mint
 *
 * Returns information about the minting endpoint
 */
export const GET = async () => {
  const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  const network = process.env.NETWORK || "base-sepolia";

  return NextResponse.json({
    endpoint: "/api/mint",
    method: "POST",
    description: "Mint 100 X402 tokens to any address",
    payment: {
      price: "$1.00",
      protocol: "x402",
    },
    tokenContract: tokenContractAddress || "Not configured",
    network,
    request: {
      body: {
        address: "0x... (Ethereum address to receive tokens)",
      },
    },
    example: {
      curl: `curl -X POST https://yourdomain.com/api/mint \\
  -H "Content-Type: application/json" \\
  -d '{"address":"0x1234..."}'`,
    },
  });
};

function getExplorerUrl(txHash: string): string {
  const network = process.env.NETWORK || "base-sepolia";
  const baseUrl = network === "base"
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";
  return `${baseUrl}/tx/${txHash}`;
}
