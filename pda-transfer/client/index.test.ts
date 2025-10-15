import * as path from "path";
import {test,expect} from "bun:test";

import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import { LiteSVM } from "litesvm";

test("sol transfer cpi with pda signer", () => {
  const svm = new LiteSVM();

  const programId = PublicKey.unique();
  const programPath = path.join(__dirname, "program.so");
  svm.addProgramFromFile(programId, "./pda_transfer.so");

  // Create recipient
  const recipient = new Keypair();

  // Derive PDA that will hold and send funds
  const [pdaAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from("pda"), recipient.publicKey.toBuffer()],
    programId
  );

  // Fund accounts
  const amount = BigInt(LAMPORTS_PER_SOL);
  svm.airdrop(recipient.publicKey, amount); // 1 SOL
  svm.airdrop(pdaAddress, amount); // 1 SOL
  

  // Create instruction data buffer
  const transferAmount = amount / BigInt(2); // 0.5 SOL
  const instructionIndex = 0; // instruction index 0 for SolTransfer enum

  const data = Buffer.alloc(9); // 1 byte for instruction enum + 8 bytes for u64
  data.writeUInt8(instructionIndex, 0); // first byte identifies the instruction
  data.writeBigUInt64LE(transferAmount, 1); // remaining bytes are instruction arguments

  // Create instruction
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: pdaAddress, isSigner: false, isWritable: true },
      { pubkey: recipient.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    data
  });

  // Create and send transaction
  const transaction = new Transaction().add(instruction);
  transaction.recentBlockhash = svm.latestBlockhash();
  transaction.sign(recipient);

  console.log("bal before transfer");
  let pdaBal1=svm.getAccount(pdaAddress);
  let recBal1=svm.getAccount(recipient.publicKey);
  console.log("pda : ",pdaBal1);
  console.log("pda : ",pdaBal1?.owner.toBase58());
  console.log("rec : ",recBal1);
  console.log("rec : ",recBal1?.owner.toBase58());
  console.log('prog id : ',programId.toBase58());
  console.log((pdaBal1?.lamports)/LAMPORTS_PER_SOL);
  console.log(recBal1?.lamports/LAMPORTS_PER_SOL);
  
  svm.sendTransaction(transaction);

  console.log("bal after transfer");
  let pdaBal2=svm.getAccount(pdaAddress);
  let recBal2=svm.getAccount(recipient.publicKey);
  console.log(pdaBal2?.lamports/LAMPORTS_PER_SOL);
  console.log(recBal2?.lamports/LAMPORTS_PER_SOL);

  // Check balances
  const recipientBalance = svm.getBalance(recipient.publicKey);
  const pdaBalance = svm.getBalance(pdaAddress);

  const transactionFee = BigInt(5000);
  // Recipient starts with 1 SOL, receives 0.5 SOL, pays tx fee
  expect(recipientBalance).toBe(amount + transferAmount - transactionFee);
  // PDA starts with 1 SOL, sends 0.5 SOL
  expect(pdaBalance).toBe(amount - transferAmount);
});