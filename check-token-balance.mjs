import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// New Whiz402 contract
const CONTRACT_ADDRESS = "0xAb31AF1090BC42DD206C893A332abeEE6e4cb6F9";

// Your wallet address
const YOUR_ADDRESS = "0x105EDdb6178Bc3A8B30C6D6552c5800026dA11F3";

const abi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

console.log("\n=== Your Whiz402 Token Balance ===\n");
console.log(`Contract: ${CONTRACT_ADDRESS}`);
console.log(`Your Address: ${YOUR_ADDRESS}\n`);

try {
  const [balance, name, symbol, decimals] = await Promise.all([
    publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'balanceOf',
      args: [YOUR_ADDRESS],
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
      functionName: 'decimals',
    }),
  ]);

  const formattedBalance = Number(balance) / (10 ** Number(decimals));

  console.log(`Token: ${name} (${symbol})`);
  console.log(`\n💰 Your Balance: ${formattedBalance.toLocaleString()} ${symbol}`);
  console.log(`   Raw: ${balance.toString()}\n`);

  if (balance > 0n) {
    console.log("✅ You have successfully received tokens!\n");
  } else {
    console.log("⚠️  No tokens found. Tokens may not have been minted yet.\n");
  }

  console.log("📍 View on BaseScan:");
  console.log(`https://basescan.org/token/${CONTRACT_ADDRESS}?a=${YOUR_ADDRESS}\n`);

} catch (error) {
  console.error("❌ Error reading balance:", error.message);
}
