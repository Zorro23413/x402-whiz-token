import { Account, toAccount } from "viem/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";
import { base, baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { env } from "./env";

// Initialize CDP Client with credentials from environment
const cdp = new CdpClient({
  apiKeyId: env.CDP_API_KEY_ID,
  apiKeySecret: env.CDP_API_KEY_SECRET,
  walletSecret: env.CDP_WALLET_SECRET,
});

const chainMap = {
  "base-sepolia": baseSepolia,
  base: base,
} as const;

export const chain = chainMap[env.NETWORK];

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export async function getOrCreatePurchaserAccount(): Promise<Account> {
  const account = await cdp.evm.getOrCreateAccount({
    name: "Purchaser",
  });
  const balances = await account.listTokenBalances({
    network: env.NETWORK,
  });

  const usdcBalance = balances.balances.find(
    (balance) => balance.token.symbol === "USDC"
  );

  // if under $0.50 while on testnet, request more
  if (
    env.NETWORK === "base-sepolia" &&
    (!usdcBalance || Number(usdcBalance.amount) < 500000)
  ) {
    const { transactionHash } = await cdp.evm.requestFaucet({
      address: account.address,
      network: env.NETWORK,
      token: "usdc",
    });
    const tx = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });
    if (tx.status !== "success") {
      throw new Error("Failed to recieve funds from faucet");
    }
  }

  return toAccount(account);
}

export async function getOrCreateSellerAccount(): Promise<Account> {
  const account = await cdp.evm.getOrCreateAccount({
    name: "Seller",
  });
  return toAccount(account);
}
