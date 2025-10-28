import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// Your new contract address
const CONTRACT_ADDRESS = "0xAb31AF1090BC42DD206C893A332abeEE6e4cb6F9";
const SELLER_ADDRESS = "0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1";

const abi = parseAbi([
  'function owner() view returns (address)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function MINT_AMOUNT() view returns (uint256)',
]);

console.log("\n=== Whiz402Token Contract Information ===\n");
console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
console.log(`Expected Owner (Seller): ${SELLER_ADDRESS}\n`);

try {
  // Get contract info
  const [owner, name, symbol, maxSupply, mintAmount] = await Promise.all([
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'owner',
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'name',
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'MAX_SUPPLY',
    }),
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'MINT_AMOUNT',
    }),
  ]);

  console.log("📋 Token Details:");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Max Supply: ${(Number(maxSupply) / 1e18).toLocaleString()} tokens`);
  console.log(`   Mint Amount: ${(Number(mintAmount) / 1e18).toLocaleString()} tokens per mint`);

  console.log(`\n🔐 Current Owner: ${owner}`);

  if (owner.toLowerCase() === SELLER_ADDRESS.toLowerCase()) {
    console.log("✅ Ownership is CORRECT! The seller account owns the contract.\n");
    console.log("✅ Your backend can now mint tokens!");
    console.log("\nNext steps:");
    console.log("1. Update .env.local with TOKEN_CONTRACT_ADDRESS");
    console.log("2. Deploy to Vercel");
    console.log("3. Test minting!\n");
  } else {
    console.log("❌ Ownership is INCORRECT!\n");
    console.log("You need to transfer ownership to the seller account:");
    console.log("1. Go to Remix");
    console.log("2. Find the transferOwnership function");
    console.log(`3. Enter: ${SELLER_ADDRESS}`);
    console.log("4. Click 'transact' and confirm in MetaMask\n");
  }

  console.log("📍 View on BaseScan:");
  console.log(`https://basescan.org/address/${CONTRACT_ADDRESS}#code\n`);

} catch (error) {
  console.error("❌ Error reading contract:", error.message);
}
