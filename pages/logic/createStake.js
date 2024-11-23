import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  MemoProgram,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const createStakeWithHash = async (walletAddress, hash) => {
  if (!walletAddress) {
    throw new Error("Wallet address is required. Please connect your wallet.");
  }

  if (!hash) {
    throw new Error("Hash is required. Please upload a file to compute its hash.");
  }

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const stakeAccount = Keypair.generate();

  // Calculate the rent-exempt balance for the stake account
  const lamports = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

  // Stake amount (e.g., 1 SOL)
  const stakeAmount = LAMPORTS_PER_SOL;

  const transaction = new Transaction().add(
    // 1. Create the stake account
    SystemProgram.createAccount({
      fromPubkey: walletAddress,
      newAccountPubkey: stakeAccount.publicKey,
      lamports: lamports + stakeAmount,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    }),

    // 2. Initialize the stake account
    StakeProgram.initialize({
      stakePubkey: stakeAccount.publicKey,
      authorized: {
        staker: walletAddress,
        withdrawer: walletAddress,
      },
      lockup: {
        unixTimestamp: 0,
        epoch: 0,
        custodian: PublicKey.default,
      },
    }),

    // 3. Add the hash using the Memo Program
    MemoProgram.memo({
      pubkeys: [],
      data: hash, // Attach the hash as a memo
    })
  );

  try {
    // Fetch the latest blockhash and set it in the transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletAddress; // Set the wallet as the fee payer

    // Request Phantom Wallet to sign the transaction
    const provider = window.solana;
    const signedTransaction = await provider.signTransaction(transaction);

    // Add the stake account's signature manually
    signedTransaction.partialSign(stakeAccount);

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log("Transaction signature:", signature);

    return {
      signature,
      stakeAccountPubkey: stakeAccount.publicKey.toString(),
    };
  } catch (err) {
    console.error("Error creating stake account with hash:", err);
    throw err; // Re-throw the error for the caller to handle
  }
};
