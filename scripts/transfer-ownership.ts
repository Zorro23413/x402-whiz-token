import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Contract ABI for transferOwnership
const TOKEN_ABI = parseAbi([
  'function owner() view returns (address)',
  'function transferOwnership(address newOwner) public',
]);

const TOKEN_CONTRACT = "0x9e3B554776258543b8a2cAF7D09c67D14C31879E" as `0x${string}`;
const NEW_OWNER = "0x1088cFcc078A93baD0cef48Bc767Fc639f5bAdF1" as `0x${string}`; // Seller account

async function main() {
  console.log("=== Transfer Whiz402 Contract Ownership ===\n");

  // You need to provide your private key that deployed the contract
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Please set DEPLOYER_PRIVATE_KEY environment variable");
    console.log("\nExample:");
    console.log("export DEPLOYER_PRIVATE_KEY=0x...");
    console.log("npm run transfer-ownership");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  console.log("Current deployer address:", account.address);
  console.log("New owner (seller account):", NEW_OWNER);
  console.log("Token contract:", TOKEN_CONTRACT);
  console.log("");

  // Check current owner
  const currentOwner = await publicClient.readContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'owner',
  });

  console.log("Current contract owner:", currentOwner);

  if (currentOwner.toLowerCase() !== account.address.toLowerCase()) {
    console.error("❌ You are not the current owner!");
    console.log("Current owner:", currentOwner);
    console.log("Your address:", account.address);
    process.exit(1);
  }

  if (currentOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
    console.log("✅ Ownership is already transferred to seller account!");
    process.exit(0);
  }

  console.log("\n⏳ Transferring ownership...");

  const hash = await walletClient.writeContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'transferOwnership',
    args: [NEW_OWNER],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    console.log("\n✅ Ownership transferred successfully!");
    console.log("Transaction:", `https://basescan.org/tx/${hash}`);

    // Verify new owner
    const newOwner = await publicClient.readContract({
      address: TOKEN_CONTRACT,
      abi: TOKEN_ABI,
      functionName: 'owner',
    });
    console.log("New owner:", newOwner);
  } else {
    console.log("\n❌ Transaction failed!");
  }
}

main().catch(console.error);
