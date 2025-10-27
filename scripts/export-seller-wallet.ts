import { CdpClient } from "@coinbase/cdp-sdk";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
  walletSecret: process.env.CDP_WALLET_SECRET!,
});

async function exportSellerWallet() {
  console.log("\n=== Exporting Seller Wallet ===\n");

  // Get the seller account
  const account = await cdp.evm.getOrCreateAccount({
    name: "Seller",
  });

  console.log("✅ Seller Account Found");
  console.log(`Address: ${account.address}`);
  console.log(`\n📍 View on BaseScan:`);
  console.log(`https://basescan.org/address/${account.address}\n`);

  // Export the private key using CDP's exportAccount method
  try {
    const privateKey = await cdp.evm.exportAccount({
      name: "Seller",
    });

    console.log("🔑 Private Key (for MetaMask import):");
    console.log(privateKey);

    console.log("\n📋 To import into MetaMask:");
    console.log("1. Open MetaMask");
    console.log("2. Click your account icon → Import Account");
    console.log("3. Select 'Private Key'");
    console.log("4. Paste the private key above");
    console.log("5. Make sure you're on Base Mainnet network");

    console.log("\n💰 To fund this wallet:");
    console.log("Send at least 0.005 ETH to:", account.address);
    console.log("Network: Base Mainnet (Chain ID: 8453)");

    console.log("\n⚠️  SECURITY WARNING:");
    console.log("Keep this private key secret! Anyone with this key can access your funds.");

  } catch (error) {
    console.error("❌ Error exporting private key:", error);
    console.log("\nYou can still send funds to the address and the backend will use it.");
  }
}

exportSellerWallet().catch(console.error);
