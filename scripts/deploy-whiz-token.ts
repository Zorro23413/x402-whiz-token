import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables
config({ path: ".env.local" });

/**
 * Deploy Whiz402Token Contract
 *
 * Token Details:
 * - Name: Whiz402
 * - Symbol: WHIZ
 * - Max Supply: 999,999,999 tokens
 * - Mint Amount: 50,000 tokens per mint
 * - Price: $1.00 USDC per mint
 *
 * DEPLOYMENT INSTRUCTIONS:
 *
 * Option 1: Using thirdweb (RECOMMENDED - Easiest)
 * ================================================
 * 1. Install thirdweb CLI globally:
 *    npm install -g thirdweb
 *
 * 2. Deploy the contract:
 *    npx thirdweb deploy src/contracts/Whiz402Token.sol
 *
 * 3. This will:
 *    - Compile your contract
 *    - Open a browser to thirdweb dashboard
 *    - Let you choose network (select "Base" - Chain ID 8453)
 *    - Deploy and verify the contract automatically
 *
 * 4. After deployment:
 *    - Copy the contract address
 *    - Run: npm run transfer-ownership
 *    - Update .env.local with new contract address
 *
 * Option 2: Using Remix IDE
 * =========================
 * 1. Go to https://remix.ethereum.org/
 * 2. Create new file: Whiz402Token.sol
 * 3. Copy contents from src/contracts/Whiz402Token.sol
 * 4. Add import remapping:
 *    @openzeppelin/=https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/
 * 5. Compile with Solidity 0.8.20+
 * 6. Connect MetaMask to Base Mainnet
 * 7. Deploy using "Injected Provider - MetaMask"
 * 8. Copy deployed contract address
 * 9. Transfer ownership to seller account:
 *    - Call transferOwnership(0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1)
 *
 * After Deployment:
 * ================
 * 1. Update .env.local:
 *    TOKEN_CONTRACT_ADDRESS=0x...
 *
 * 2. The middleware and minting will automatically use:
 *    - Price: $1.00 USDC
 *    - Amount: 50,000 tokens per mint
 */

async function main() {
  console.log("\n=== Deploy Whiz402Token Contract ===\n");

  console.log("📋 Contract Details:");
  console.log("   Name: Whiz402");
  console.log("   Symbol: WHIZ");
  console.log("   Max Supply: 999,999,999 tokens");
  console.log("   Mint Amount: 50,000 tokens per mint");
  console.log("   Price: $1.00 USDC per mint\n");

  console.log("🚀 Quick Deploy with thirdweb:");
  console.log("   npx thirdweb deploy src/contracts/Whiz402Token.sol\n");

  console.log("📍 Network: Base Mainnet (Chain ID: 8453)");
  console.log("🔐 Initial Owner: Your wallet (will transfer to seller)\n");

  console.log("⚠️  After deployment:");
  console.log("   1. Transfer ownership to seller account");
  console.log("   2. Update TOKEN_CONTRACT_ADDRESS in .env.local");
  console.log("   3. Update frontend to show new pricing\n");

  console.log("💡 Current seller account:");
  console.log("   0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1\n");

  // Show contract code location
  const contractPath = resolve(__dirname, "../src/contracts/Whiz402Token.sol");
  console.log("📄 Contract location:");
  console.log(`   ${contractPath}\n`);

  console.log("✅ Ready to deploy!");
  console.log("   Run: npx thirdweb deploy src/contracts/Whiz402Token.sol\n");
}

main().catch(console.error);
