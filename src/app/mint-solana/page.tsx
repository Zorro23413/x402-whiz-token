"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PublicKey } from "@solana/web3.js";

export default function MintSolanaPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidSolanaAddress = (addr: string) => {
    try {
      new PublicKey(addr);
      return true;
    } catch {
      return false;
    }
  };

  const handleMint = async () => {
    setError(null);
    setResult(null);

    // Validate Solana address
    if (!address || !isValidSolanaAddress(address)) {
      setError("Please enter a valid Solana address");
      return;
    }

    setLoading(true);

    try {
      // For now, just call the API directly
      // TODO: Add Solana wallet adapter and X402 payment
      const response = await fetch("/api/mint-solana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Minting failed");
      }

      setResult(data);
    } catch (err) {
      console.error("Mint error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Solana SPL Token Minting
            </h1>
            <p className="text-gray-300">
              Mint 50,000 SPL tokens using X402 payment protocol
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full">
              <span className="text-sm text-purple-200">Price:</span>
              <span className="text-lg font-bold text-white">$0.10 USDC</span>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">
              ⚡ Solana Advantages:
            </h3>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>400ms finality (10x faster than Base)</li>
              <li>$0.00025 transaction cost (40x cheaper)</li>
              <li>Supports all SPL tokens</li>
            </ul>
          </div>

          {/* Mint Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Recipient Solana Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Solana address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleMint}
              disabled={loading || !address}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Minting..." : "Mint 50,000 SPL Tokens"}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="mt-6 p-6 bg-green-500/20 border border-green-500/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-200">
                  Tokens Minted Successfully!
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">
                    {result.amount} SPL Tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono text-xs">
                    {result.recipient.slice(0, 8)}...{result.recipient.slice(-8)}
                  </span>
                </div>
                {result.signature && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Signature:</span>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline text-xs font-mono"
                    >
                      {result.signature.slice(0, 8)}...
                      {result.signature.slice(-8)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">
              How it works:
            </h3>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Enter the Solana address to receive tokens</li>
              <li>Click "Mint 50,000 SPL Tokens" to initiate payment</li>
              <li>Pay $0.10 USDC via X402 protocol</li>
              <li>Receive 50,000 SPL tokens instantly on Solana</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Powered by{" "}
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              X402 Protocol
            </a>
            {" "}on Solana
          </p>
        </div>
      </div>
    </div>
  );
}
