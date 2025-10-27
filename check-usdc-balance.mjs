import { createPublicClient, http, formatUnits, parseAbi } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

// USDC contract on Base Mainnet
const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const sellerAddress = "0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1";

// ERC20 ABI for balanceOf
const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
]);

console.log("\n=== Seller Account USDC Balance ===");
console.log(`Address: ${sellerAddress}`);
console.log(`Network: Base Mainnet`);

// Get USDC balance
const balance = await publicClient.readContract({
  address: USDC_CONTRACT,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [sellerAddress]
});

// USDC has 6 decimals
const usdcBalance = formatUnits(balance, 6);

console.log(`\n💰 USDC Balance: ${usdcBalance} USDC`);
console.log(`   (${balance.toString()} in base units)`);

if (balance > 0n) {
  console.log(`\n✅ You have received USDC payments!`);
  console.log(`   This is YOUR money from users who paid $0.10 to mint tokens.`);
} else {
  console.log(`\n⏳ No USDC received yet.`);
  console.log(`   When users pay $0.10 USDC, it will appear here.`);
}

console.log(`\n📍 View on BaseScan:`);
console.log(`https://basescan.org/token/${USDC_CONTRACT}?a=${sellerAddress}`);

console.log(`\n💡 To withdraw USDC:`);
console.log(`   The wallet is managed by Coinbase Developer Platform (CDP).`);
console.log(`   You'll need to use CDP API to transfer USDC to your personal wallet.`);
