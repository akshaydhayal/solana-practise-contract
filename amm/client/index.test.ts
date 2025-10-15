import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as spl from "@solana/spl-token";
import type { Key } from "react";
import * as borsh from "borsh";

spl.AccountLayout; //165 bytes  153
let ataSchema:borsh.Schema={
    struct:{
        mint:{array:{type:'u8',len:32}},
        owner:{array:{type:'u8',len:32}},
        amount:'u64',
        delegateOption:'u32',
        delegate:{array:{type:'u8',len:32}},
        state:'u8',
        isNativeOption:'u32',
        isNative:'u64',
        delegatedAmount:'u64',
        closeAuthorityOption:'u32',
        closeAuthority:{array:{type:'u8',len:32}},
    }
}

let poolPdaSchema:borsh.Schema={
    struct:{
        owner:{array:{type:'u8',len:32}},
        mintA:{array:{type:'u8',len:32}},
        mintB:{array:{type:'u8',len:32}},
        amountA:'u64',
        amountB:'u64',
        feeBps:'u16',
        lpToken:{array:{type:'u8',len:32}},
    }
}
spl.MintLayout
let mintSchema:borsh.Schema={
    struct:{
        mintAuthorityOption:'u32',
        mintAuthority:{array:{type:'u8',len:32}},
        supply:'u64',
        decimal:'u8',
        isInitialised:'bool',
        freezeAuthorityOption:'u32',
        freezeAuthority:{array:{type:'u8',len:32}},
    }
}
describe("amm tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let ammProg:PublicKey;
    let poolPda:PublicKey;

    let mintA:Keypair;
    let mintB:Keypair;
    let vaultAAta:PublicKey;
    let vaultBAta:PublicKey;
    // let lpMint:PublicKey;
    let lpMint:Keypair;
    let poolBump:number;
    let ataA:PublicKey;
    let ataB:PublicKey;
    
    beforeAll(()=>{
        console.log("a");
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        ammProg=PublicKey.unique();
        mintA=Keypair.generate();
        mintB=Keypair.generate();
        // lpMint=PublicKey.unique();
        lpMint=Keypair.generate();

        [poolPda,poolBump]=PublicKey.findProgramAddressSync(
            [Buffer.from("pool"),mintA.publicKey.toBuffer(),mintB.publicKey.toBuffer(),userAcc.publicKey.toBuffer()],
            ammProg
        );
        
        svm.addProgramFromFile(ammProg,"../target/deploy/program.so");
        svm.airdrop(userAcc.publicKey,BigInt(5*LAMPORTS_PER_SOL));
        
        //creating Mint A and Mint B account
        let mintAcreateIx=SystemProgram.createAccount({
            fromPubkey:userAcc.publicKey,
            newAccountPubkey:mintA.publicKey,
            lamports:Number(svm.minimumBalanceForRentExemption(BigInt(spl.MINT_SIZE))),
            space:spl.MINT_SIZE,
            programId:spl.TOKEN_PROGRAM_ID
        });
        let mintBcreateIx=SystemProgram.createAccount({
            fromPubkey:userAcc.publicKey,
            newAccountPubkey:mintB.publicKey,
            lamports:Number(svm.minimumBalanceForRentExemption(BigInt(spl.MINT_SIZE))),
            space:spl.MINT_SIZE,
            programId:spl.TOKEN_PROGRAM_ID
        });
        let tx=new Transaction().add(mintAcreateIx,mintBcreateIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc,mintA,mintB);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        console.log("mint a and mint b acount created");
        
        //Initialising Mint A and Mint B account
        let mintAInitialiseIx=spl.createInitializeMint2Instruction(mintA.publicKey,5,userAcc.publicKey,userAcc.publicKey,spl.TOKEN_PROGRAM_ID);
        let mintBInitialiseIx=spl.createInitializeMint2Instruction(mintB.publicKey,5,userAcc.publicKey,userAcc.publicKey,spl.TOKEN_PROGRAM_ID);
        tx=new Transaction().add(mintAInitialiseIx,mintBInitialiseIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        console.log("mint a and mint b acount initialized");
        
        //create 2 ata for mint A and Mint B
        ataA=spl.getAssociatedTokenAddressSync(mintA.publicKey,userAcc.publicKey,false);
        ataB=spl.getAssociatedTokenAddressSync(mintB.publicKey,userAcc.publicKey,false);
        let ataACreateIx=spl.createAssociatedTokenAccountInstruction(userAcc.publicKey,ataA,userAcc.publicKey,mintA.publicKey,spl.TOKEN_PROGRAM_ID);
        let ataBCreateIx=spl.createAssociatedTokenAccountInstruction(userAcc.publicKey,ataB,userAcc.publicKey,mintB.publicKey,spl.TOKEN_PROGRAM_ID);
        tx=new Transaction().add(ataACreateIx,ataBCreateIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        console.log("ata a and ata b created for mint a and mint b");
        
        //now mint some Token A and Token B to ata A and ata B
        let mintAIx=spl.createMintToInstruction(mintA.publicKey,ataA,userAcc.publicKey,1000);
        let mintBIx=spl.createMintToInstruction(mintB.publicKey,ataB,userAcc.publicKey,1500);
        tx=new Transaction().add(mintAIx,mintBIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let ataAData=svm.getAccount(ataA);
        console.log("ataA : ",borsh.deserialize(ataSchema,ataAData?.data));
        let ataBData=svm.getAccount(ataB);
        console.log("ataB : ",borsh.deserialize(ataSchema,ataBData?.data));
        console.log("minted 1000 a tokens to ata a and 1500 tokens b to ata b")
        
        vaultAAta=spl.getAssociatedTokenAddressSync(mintA.publicKey,poolPda,true);
        vaultBAta=spl.getAssociatedTokenAddressSync(mintB.publicKey,poolPda,true);
        console.log("vault a ata ",vaultAAta.toBase58())
        console.log("vault b ata ",vaultBAta.toBase58())
    }),
      
    it("create lp poop",()=>{
        let ix=new TransactionInstruction({
            programId:ammProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:poolPda, isSigner:false, isWritable:true}, 
                {pubkey:vaultAAta, isSigner:false, isWritable:true}, 
                {pubkey:vaultBAta, isSigner:false, isWritable:true}, 
                {pubkey:mintA.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:mintB.publicKey, isSigner:false, isWritable:true}, 
                // {pubkey:lpMint, isSigner:false, isWritable:true}, 
                {pubkey:lpMint.publicKey, isSigner:true, isWritable:true}, 
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
            ],
            data:Buffer.from([0,200,0,poolBump])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc,lpMint);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let poolPdaData=svm.getAccount(poolPda);
        console.log(poolPdaData?.lamports);
        console.log(poolPdaData?.owner);
        console.log(poolPdaData?.data.length);
        console.log("Pool PDA : ",borsh.deserialize(poolPdaSchema,poolPdaData?.data));

        let lpMintData=svm.getAccount(lpMint.publicKey);
        console.log("lpMint data : ",borsh.deserialize(mintSchema,lpMintData?.data));
    }),

    it("add liquidity",()=>{
        console.log("pool pda : ",poolPda.toBase58());
        console.log("user ata a : ",ataA.toBase58());
        let userLpMintAta=spl.getAssociatedTokenAddressSync(lpMint.publicKey,userAcc.publicKey,false);
        console.log("user ata for lp mint : ",userLpMintAta.toBase58());
        let ix=new TransactionInstruction({
            programId:ammProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:poolPda, isSigner:false, isWritable:true}, 
                {pubkey:vaultAAta, isSigner:false, isWritable:true}, 
                {pubkey:vaultBAta, isSigner:false, isWritable:true}, 
                
                {pubkey:mintA.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:mintB.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:ataA, isSigner:false, isWritable:true},
                {pubkey:ataB, isSigner:false, isWritable:true},

                {pubkey:lpMint.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:userLpMintAta, isSigner:false, isWritable:true}, 
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
            ],
            data:Buffer.from([
                1,
                50,0,0,0,0,0,0,0,
                10,0,0,0,0,0,0,0
                ,poolBump
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let poolPdaData=svm.getAccount(poolPda);
        console.log(poolPdaData?.lamports);
        console.log(poolPdaData?.owner);
        console.log(poolPdaData?.data.length);
        console.log("Pool PDA : ",borsh.deserialize(poolPdaSchema,poolPdaData?.data));

        let lpMintData=svm.getAccount(lpMint.publicKey);
        console.log("lpMint data : ",borsh.deserialize(mintSchema,lpMintData?.data));

        //providing second liquidity
        svm.expireBlockhash();
        ix=new TransactionInstruction({
            programId:ammProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:poolPda, isSigner:false, isWritable:true}, 
                {pubkey:vaultAAta, isSigner:false, isWritable:true}, 
                {pubkey:vaultBAta, isSigner:false, isWritable:true}, 

                {pubkey:mintA.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:mintB.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:ataA, isSigner:false, isWritable:true},
                {pubkey:ataB, isSigner:false, isWritable:true},

                {pubkey:lpMint.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:userLpMintAta, isSigner:false, isWritable:true}, 
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false}, 
            ],
            data:Buffer.from([
                1,
                100,0,0,0,0,0,0,0,
                15,0,0,0,0,0,0,0
                ,poolBump
            ])
        });
        tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        poolPdaData=svm.getAccount(poolPda);
        console.log(poolPdaData?.lamports);
        console.log(poolPdaData?.owner);
        console.log(poolPdaData?.data.length);
        console.log("Pool PDA : ",borsh.deserialize(poolPdaSchema,poolPdaData?.data));

        lpMintData=svm.getAccount(lpMint.publicKey);
        console.log("lpMint data : ",borsh.deserialize(mintSchema,lpMintData?.data));
        let userLpMintAtaData=svm.getAccount(userLpMintAta);
        console.log("user LpMint AtaData : ",borsh.deserialize(ataSchema,userLpMintAtaData?.data));

        let userAtaAData=svm.getAccount(ataA);
        console.log("user Ata a Data : ",borsh.deserialize(ataSchema,userAtaAData?.data));
        let userAtaBData=svm.getAccount(ataB);
        console.log("user ata b Data : ",borsh.deserialize(ataSchema,userAtaBData?.data));
    }),
    it("remove liquity",()=>{
        let userLpMintAta=spl.getAssociatedTokenAddressSync(lpMint.publicKey,userAcc.publicKey,false);
        console.log("lp mint : ",lpMint.publicKey.toBase58());
        console.log("user acc : ",userAcc.publicKey.toBase58());
        console.log("pool pda : ",poolPda.toBase58());  
        //invoke signed to use instead of invoke for trasnfering from vault ata, as pool pda is owner of it
        let ix=new TransactionInstruction({
            programId:ammProg,
            keys:[
                {pubkey:userAcc.publicKey, isWritable:true, isSigner:true},
                {pubkey:poolPda, isWritable:true, isSigner:false},
                {pubkey:vaultAAta, isWritable:true, isSigner:false},
                {pubkey:vaultBAta, isWritable:true, isSigner:false},

                {pubkey:mintA.publicKey, isWritable:true, isSigner:false},   
                {pubkey:mintB.publicKey, isWritable:true, isSigner:false},
                {pubkey:ataA, isWritable:true, isSigner:false},
                {pubkey:ataB, isWritable:true, isSigner:false},

                {pubkey:lpMint.publicKey, isWritable:true, isSigner:false},   //signer needed
                {pubkey:userLpMintAta, isWritable:true, isSigner:false},   
                {pubkey:SystemProgram.programId, isWritable:false, isSigner:false},   
                {pubkey:spl.TOKEN_PROGRAM_ID, isWritable:false, isSigner:false},   
                
            ],
            data:Buffer.from([
                2,
                50,0,0,0,0,0,0,0,
                poolBump
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let poolPdaData=svm.getAccount(poolPda);
        console.log("pool pda data : ",borsh.deserialize(poolPdaSchema,poolPdaData?.data));

        let lpMintData=svm.getAccount(lpMint.publicKey);
        console.log("lp mint acc data : ",borsh.deserialize(mintSchema,lpMintData?.data));

        let userLpMintAtaData=svm.getAccount(userLpMintAta);
        console.log("user LpMint AtaData : ",borsh.deserialize(ataSchema,userLpMintAtaData?.data));

        let userAtaAData=svm.getAccount(ataA);
        console.log("user Ata a Data : ",borsh.deserialize(ataSchema,userAtaAData?.data));
        let userAtaBData=svm.getAccount(ataB);
        console.log("user ata b Data : ",borsh.deserialize(ataSchema,userAtaBData?.data));
    })
})


