import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { Account } from "viem/accounts";
import { chain } from "./accounts";

// Secure ERC20 Token ABI with supply cap
const TOKEN_ABI = parseAbi([
  'function mint(address to) public',
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function remainingSupply() view returns (uint256)',
  'function remainingMints() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function MINT_AMOUNT() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event TokensMinted(address indexed to, uint256 amount, uint256 newTotalSupply)'
]);

const MINT_AMOUNT = 50_000n * 10n ** 18n; // 50,000 tokens with 18 decimals

export interface TokenMintResult {
  success: boolean;
  transactionHash?: string;
  amount: string;
  recipient: string;
  error?: string;
}

/**
 * Mint tokens using a deployed contract
 */
export async function mintTokens(
  contractAddress: `0x${string}`,
  recipientAddress: `0x${string}`,
  sellerAccount: Account,
  amount?: bigint // Optional custom amount, defaults to contract's MINT_AMOUNT
): Promise<TokenMintResult> {
  try {
    const walletClient = createWalletClient({
      account: sellerAccount,
      chain,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Call the mint function (only owner can call - sellerAccount is the owner)
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'mint',
      args: [recipientAddress],
    });

    // Return immediately without waiting for confirmation
    // This prevents Vercel 60s timeout while transaction completes on-chain
    return {
      success: true,
      transactionHash: hash,
      amount: '50000',
      recipient: recipientAddress,
    };
  } catch (error) {
    console.error('Token mint error:', error);
    return {
      success: false,
      recipient: recipientAddress,
      amount: '50000',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  contractAddress: `0x${string}`,
  address: `0x${string}`
): Promise<bigint> {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const balance = await publicClient.readContract({
    address: contractAddress,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return balance;
}

/**
 * Get token info (name, symbol, decimals)
 */
export async function getTokenInfo(contractAddress: `0x${string}`) {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const [name, symbol, decimals] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'name',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'decimals',
    }),
  ]);

  return { name, symbol, decimals };
}

/**
 * Get token supply information
 */
export async function getSupplyInfo(contractAddress: `0x${string}`) {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const [totalSupply, maxSupply, remainingSupply, remainingMints] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'totalSupply',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'MAX_SUPPLY',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'remainingSupply',
    }),
    publicClient.readContract({
      address: contractAddress,
      abi: TOKEN_ABI,
      functionName: 'remainingMints',
    }),
  ]);

  return {
    totalSupply: totalSupply.toString(),
    maxSupply: maxSupply.toString(),
    remainingSupply: remainingSupply.toString(),
    remainingMints: remainingMints.toString(),
  };
}
