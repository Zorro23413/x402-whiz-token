import { CdpClient } from "@coinbase/cdp-sdk";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  walletSecret: process.env.CDP_WALLET_SECRET!,
});

async function withdrawUSDC() {
  // IMPORTANT: Replace this with YOUR personal wallet address
  const YOUR_WALLET = "PUT_YOUR_METAMASK_ADDRESS_HERE";

  if (YOUR_WALLET === "PUT_YOUR_METAMASK_ADDRESS_HERE") {
    console.error("\n❌ ERROR: Please edit this file and add your MetaMask address!");
    console.log("   Open: scripts/withdraw-usdc.ts");
    console.log("   Change line 13 to your address\n");
    process.exit(1);
  }

  console.log("\n=== Withdrawing USDC to Your Wallet ===\n");

  // Get the seller account
  const sellerAccount = await cdp.evm.getOrCreateAccount({
    name: "Seller",
  });

  console.log(`From (Seller): ${sellerAccount.address}`);
  console.log(`To (You):       ${YOUR_WALLET}`);

  // Check current USDC balance
  const balances = await sellerAccount.listTokenBalances({
    network: "base",
  });

  const usdcBalance = balances.balances.find(
    (b) => b.token.symbol === "USDC"
  );

  if (!usdcBalance || Number(usdcBalance.amount) === 0) {
    console.log("\n❌ No USDC to withdraw!");
    console.log("   Balance: 0 USDC\n");
    process.exit(0);
  }

  console.log(`\nCurrent Balance: ${Number(usdcBalance.amount) / 1_000_000} USDC`);
  console.log("\n⏳ Transferring USDC...");

  try {
    // Transfer all USDC to your wallet
    const result = await sellerAccount.transfer({
      to: YOUR_WALLET,
      amount: BigInt(usdcBalance.amount), // Send all USDC
      token: "usdc",
      network: "base",
    });

    console.log("\n✅ USDC Withdrawn Successfully!");
    console.log(`\nTransaction Hash: ${result.transactionHash}`);
    console.log(`View on BaseScan: https://basescan.org/tx/${result.transactionHash}`);

    console.log(`\n💰 You received: ${Number(usdcBalance.amount) / 1_000_000} USDC`);
    console.log(`   in your wallet: ${YOUR_WALLET}`);

  } catch (error) {
    console.error("\n❌ Error withdrawing USDC:", error);

    if (error instanceof Error && error.message.includes("insufficient funds")) {
      console.log("\n💡 TIP: The seller wallet needs ETH for gas fees!");
      console.log("   Send 0.001 ETH to:", sellerAccount.address);
    }
  }
}

withdrawUSDC().catch(console.error);
