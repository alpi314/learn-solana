"use client";

import crypto from "crypto-browserify"; // For hashing the file (SHA-256)
import { useState } from "react";
import { connectWallet } from "./logic/connectWallet";
import { createStakeWithHash } from "./logic/createStake";

export default function UploadPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [stakeAccountPubkey, setStakeAccountPubkey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload and compute its hash
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    // Compute SHA-256 hash of the file
    const fileArrayBuffer = await uploadedFile.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    const computedHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    setHash(computedHash);
    console.log("Computed Hash:", computedHash);
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet(setWalletAddress);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle stake creation
  const handleCreateStake = async () => {
    if (!walletAddress || !hash) {
      alert("Please connect your wallet and upload a file first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { signature, stakeAccountPubkey } = await createStakeWithHash(walletAddress, hash);
      setStakeAccountPubkey(stakeAccountPubkey);
      alert(`Stake account created successfully! View it on Solana Explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (err) {
      alert("Error creating stake account. Check the console for details.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Upload File and Stake with Hash</h1>

      {/* Wallet Connection */}
      {walletAddress ? (
        <p>Connected wallet: {walletAddress.toString()}</p>
      ) : (
        <button onClick={handleConnectWallet}>Connect to Phantom Wallet</button>
      )}

      {/* File Upload and Hash Computation */}
      <div>
        <h2>Step 1: Upload File</h2>
        <input type="file" onChange={handleFileUpload} accept=".pdf" />
        {hash && <p>Computed Hash: {hash}</p>}
      </div>

      {/* Create Stake Account */}
      <div>
        <h2>Step 2: Create Stake Account with Hash</h2>
        <button onClick={handleCreateStake} disabled={isSubmitting}>
          {isSubmitting ? "Creating Stake..." : "Stake with Hash"}
        </button>
      </div>

      {/* Display Stake Account Info */}
      {stakeAccountPubkey && (
        <div>
          <h3>Stake Account Created</h3>
          <p>Stake Account Pubkey: {stakeAccountPubkey}</p>
          <p>
            View on Explorer:{" "}
            <a
              href={`https://explorer.solana.com/address/${stakeAccountPubkey}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {stakeAccountPubkey}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
