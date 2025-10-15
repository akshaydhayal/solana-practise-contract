import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {AnchorSwap} from "../target/types/anchor_swap";
import * as spl from "@solana/spl-token";
import { SystemProgram, Transaction } from "@solana/web3.js";

describe("swap tests",()=>{
  let program=anchor.workspace.AnchorSwap as Program<AnchorSwap>;
  let provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let user=provider.wallet as anchor.Wallet;
  let mintA=anchor.web3.Keypair.generate();
  let mintB=anchor.web3.Keypair.generate();
  let connection=provider.connection;

  console.log("mint a : ",mintA.publicKey.toBase58());
  console.log("mint b : ",mintB.publicKey.toBase58());

  before(async()=>{
    //create 2 mint accounts and initialize them also
    let mintACreateIx=SystemProgram.createAccount({
      fromPubkey:user.publicKey,newAccountPubkey:mintA.publicKey,space:spl.MINT_SIZE, lamports:await connection.getMinimumBalanceForRentExemption(spl.MINT_SIZE),programId:spl.TOKEN_PROGRAM_ID
    });
    let mintAInitializeIx=spl.createInitializeMint2Instruction(mintA.publicKey,5,user.publicKey,user.publicKey,spl.TOKEN_PROGRAM_ID);
   
    let mintBCreateIx=SystemProgram.createAccount({
      fromPubkey:user.publicKey,newAccountPubkey:mintB.publicKey,space:spl.MINT_SIZE, lamports:await connection.getMinimumBalanceForRentExemption(spl.MINT_SIZE),programId:spl.TOKEN_PROGRAM_ID
    });
    let mintBInitializeIx=spl.createInitializeMint2Instruction(mintB.publicKey,6,user.publicKey,user.publicKey,spl.TOKEN_PROGRAM_ID);
   
    let tx=new Transaction().add(mintACreateIx,mintAInitializeIx,mintBCreateIx,mintBInitializeIx);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.sign(user.payer,mintA,mintB);
    let txStatus=await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txStatus);
    console.log("tx status : ",txStatus);
    
    let userData=await connection.getAccountInfo(user.publicKey);
    console.log("user data : ",userData.lamports);
    let mintAData=await connection.getAccountInfo(mintA.publicKey);
    console.log("mintA : ",mintAData);
    let mintBData=await connection.getAccountInfo(mintB.publicKey);
    console.log("mintB : ",mintBData);

    // create ata accounts 
    let userAtaA=await spl.getOrCreateAssociatedTokenAccount(connection,user.payer,mintA.publicKey,user.publicKey);
    // minting token mint a tokens to user ata a
    let mintIx=spl.createMintToCheckedInstruction(mintA.publicKey,userAtaA.address,user.publicKey,15,5);
    tx=new Transaction().add(mintIx);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.sign(user.payer);
    txStatus=await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txStatus);

    let userAtaAData=await connection.getAccountInfo(userAtaA.address);
    console.log("user ata a data : ",userAtaAData.data);
    // connection.getTokenAccountBalance()
  }),
  
  it("make offer test",async()=>{

    await program.methods.makeOffer(
      new anchor.BN(1),new anchor.BN(1),new anchor.BN(2)
    )
    .accounts({
      maker:user.payer.publicKey,
      tokenMintA:mintA.publicKey,
      tokenMintB:mintB.publicKey,
      tokenProgram:spl.TOKEN_PROGRAM_ID
    })
    .signers([user.payer])
    .rpc();
  }),

  it("take offer test",async()=>{
    
    let taker=anchor.web3.Keypair.generate();
    let takerAtaB=await spl.getOrCreateAssociatedTokenAccount(connection,user.payer,mintB.publicKey,taker.publicKey);
    let txSt=await spl.mintTo(connection,user.payer,mintB.publicKey,takerAtaB.address,user.payer,100)
    await connection.confirmTransaction(txSt);

    let takerCreateIx=SystemProgram.createAccount({
      fromPubkey:user.publicKey,newAccountPubkey:taker.publicKey,space:0, lamports:await connection.getMinimumBalanceForRentExemption(0),programId:SystemProgram.programId
    })
    let tx=new Transaction().add(takerCreateIx);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.sign(user.payer,taker);
    let txStatus=await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(txStatus);

    //airdropping lamports to taker as taker will be used to create some ata inside the contract
    let airdropSig=await connection.requestAirdrop(taker.publicKey,1000000000);
    await connection.confirmTransaction(airdropSig);

    await program.methods.takeOffer(new anchor.BN(1)).accounts({
      maker:user.publicKey,
      taker:taker.publicKey,
      tokenMintA:mintA.publicKey,
      tokenMintB:mintB.publicKey,
      tokenProgram:spl.TOKEN_PROGRAM_ID
    })
    .signers([taker])
    .rpc();
  })
})