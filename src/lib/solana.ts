import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Solana configuration
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(NETWORK as any);

// Create Solana connection
export const connection = new Connection(RPC_ENDPOINT, "confirmed");

// Get network (mainnet-beta or devnet)
export const getNetwork = () => NETWORK;

/**
 * Get or create seller keypair from environment
 */
export function getSellerKeypair(): Keypair {
  const privateKeyString = process.env.SOLANA_SELLER_PRIVATE_KEY;

  if (!privateKeyString) {
    throw new Error("SOLANA_SELLER_PRIVATE_KEY not set in environment variables");
  }

  try {
    // Parse the private key (should be array of numbers or base58)
    const privateKey = JSON.parse(privateKeyString);
    return Keypair.fromSecretKey(new Uint8Array(privateKey));
  } catch (error) {
    throw new Error("Invalid SOLANA_SELLER_PRIVATE_KEY format. Should be JSON array of numbers.");
  }
}

/**
 * Get token mint public key
 */
export function getTokenMint(): PublicKey {
  const mintAddress = process.env.SOLANA_TOKEN_MINT;

  if (!mintAddress) {
    throw new Error("SOLANA_TOKEN_MINT not set in environment variables");
  }

  try {
    return new PublicKey(mintAddress);
  } catch (error) {
    throw new Error("Invalid SOLANA_TOKEN_MINT address");
  }
}

export interface SolanaMintResult {
  success: boolean;
  signature?: string;
  amount: string;
  recipient: string;
  error?: string;
}

/**
 * Mint SPL tokens to a recipient
 */
export async function mintSPLTokens(
  recipientAddress: string,
  amount: number
): Promise<SolanaMintResult> {
  try {
    const sellerKeypair = getSellerKeypair();
    const mintPublicKey = getTokenMint();
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Get or create the recipient's token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      sellerKeypair,
      mintPublicKey,
      recipientPublicKey
    );

    // Mint tokens (amount in smallest units, e.g., lamports)
    // Assuming 9 decimals for SPL token (like SOL)
    const amountInSmallestUnit = amount * Math.pow(10, 9);

    const signature = await mintTo(
      connection,
      sellerKeypair,
      mintPublicKey,
      recipientTokenAccount.address,
      sellerKeypair.publicKey,
      amountInSmallestUnit
    );

    return {
      success: true,
      signature,
      amount: amount.toString(),
      recipient: recipientAddress,
    };
  } catch (error) {
    console.error("Solana mint error:", error);
    return {
      success: false,
      amount: amount.toString(),
      recipient: recipientAddress,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a new SPL token mint
 * Only needed once during setup
 */
export async function createTokenMint(
  decimals: number = 9
): Promise<PublicKey> {
  const sellerKeypair = getSellerKeypair();

  const mint = await createMint(
    connection,
    sellerKeypair,
    sellerKeypair.publicKey, // mint authority
    sellerKeypair.publicKey, // freeze authority
    decimals,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log("Created token mint:", mint.toBase58());
  return mint;
}

/**
 * Get Solana explorer URL
 */
export function getSolanaExplorerUrl(signature: string, network: string = NETWORK): string {
  if (network === "mainnet-beta") {
    return `https://solscan.io/tx/${signature}`;
  }
  return `https://solscan.io/tx/${signature}?cluster=${network}`;
}
