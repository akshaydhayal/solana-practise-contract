import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as spl from "@solana/spl-token";
import { LiteSvm } from "litesvm/dist/internal";
import * as borsh from "borsh";

spl.MintLayout;
let vaultSchema:borsh.Schema={
    struct:{
        owner:{array:{type:'u8',len:32}},
        tokenAccount:{array:{type:'u8',len:32}},
        isLocked:'bool',
        unlockTimestamp:'u64'
    }
}
spl.AccountLayout;
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
describe("vault tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let mintAcc:Keypair;
    let mintAta1:PublicKey;
    let vaultMintAta:PublicKey;
    let vaultPda:PublicKey;
    let vaultProgram:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        mintAcc=Keypair.generate();

        vaultProgram=PublicKey.unique();
        svm.addProgramFromFile(vaultProgram,"../target/deploy/vault1.so");
        svm.airdrop(userAcc.publicKey,BigInt(10*LAMPORTS_PER_SOL));

        //creating a mint account to store mint related details
        let mintAccountCreateIX=SystemProgram.createAccount({
            fromPubkey:userAcc.publicKey, newAccountPubkey:mintAcc.publicKey,
            lamports: Number(svm.minimumBalanceForRentExemption(BigInt(82))),
            // space:82, programId:SystemProgram.programId
            space:82, programId:spl.TOKEN_PROGRAM_ID
        });
        let tx=new Transaction().add(mintAccountCreateIX);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc,mintAcc);
        let txStatus=svm.sendTransaction(tx);
        // console.log(txStatus.toString());

        let mintAccData=svm.getAccount(mintAcc.publicKey);
        console.log("mint acc after creating mint : ",mintAccData?.data);
        svm.expireBlockhash();

        //now initialising the mint account we created above
        let initializeMintIx=spl.createInitializeMint2Instruction(mintAcc.publicKey,
            5,userAcc.publicKey,userAcc.publicKey,spl.TOKEN_PROGRAM_ID
        );
        tx=new Transaction().add(initializeMintIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        // console.log(txStatus.toString());

        mintAccData=svm.getAccount(mintAcc.publicKey);
        console.log("mint acc after initialising mint: ",mintAccData?.data);

        //now we will mint tokens to a Associate token account
        mintAta1=spl.getAssociatedTokenAddressSync(mintAcc.publicKey,userAcc.publicKey);
        
        let create_ata_ix=spl.createAssociatedTokenAccountInstruction(userAcc.publicKey,
            mintAta1,userAcc.publicKey, mintAcc.publicKey, spl.TOKEN_PROGRAM_ID
        );
        tx=new Transaction().add(create_ata_ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        txStatus=svm.sendTransaction(tx);
        // console.log(txStatus.toString());
        
        let mintAta1Data=svm.getAccount(mintAta1);
        console.log("mint ata1 : ",mintAta1Data?.data);

        let mintToIx=spl.createMintToInstruction(mintAcc.publicKey,mintAta1,
            userAcc.publicKey,250);
            tx=new Transaction().add(mintToIx);
            tx.recentBlockhash=svm.latestBlockhash();
            tx.sign(userAcc);
            txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        mintAccData=svm.getAccount(mintAcc.publicKey);
        console.log("mint acc after minting tokens: ",mintAccData?.data);
        
        mintAta1Data=svm.getAccount(mintAta1);
        let deserialisedMintAta1Data=borsh.deserialize(ataSchema,mintAta1Data?.data);
        console.log(userAcc.publicKey.toBytes());
        console.log("mint ata1 after minting tokens: ",deserialisedMintAta1Data);
        
        
        [vaultPda,bump]=PublicKey.findProgramAddressSync([
            Buffer.from("vault"),userAcc.publicKey.toBuffer(), mintAcc.publicKey.toBuffer()
        ],vaultProgram);
        console.log("vault pda : ",vaultPda.toBase58());
        vaultMintAta=spl.getAssociatedTokenAddressSync(mintAcc.publicKey,vaultPda,true);
        console.log("vault mint ata : ",vaultMintAta.toBase58());

    }),

    it("vault init",()=>{
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta1, isSigner:false, isWritable:false},
                {pubkey:vaultMintAta, isSigner:false, isWritable:true},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let vaultPdaData=svm.getAccount(vaultPda);
        let deserialisedVaultData=borsh.deserialize(vaultSchema,vaultPdaData?.data);
        console.log("vault pda : ",deserialisedVaultData);

        let vaultMintAtaData=svm.getAccount(vaultMintAta);
        let deserialisedVaultMintAtaData=borsh.deserialize(ataSchema,vaultMintAtaData?.data);
        console.log("vault mint ata : ",deserialisedVaultMintAtaData);
    }),

    it("deposit 100 mint tokens to vault pda",()=>{
        console.log("mint ata : ",mintAta1.toBase58());
        console.log("vaut mint ata : ",vaultMintAta.toBase58());
        
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey: userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey: mintAta1, isSigner:false, isWritable:true},
                {pubkey: vaultMintAta, isSigner:false, isWritable:true},
                // {pubkey: SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey: spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1,100,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAta1Data=svm.getAccount(mintAta1);
        let deserialisedMintAta1Data=borsh.deserialize(ataSchema,mintAta1Data?.data);
        console.log("mint ata1 account : ",deserialisedMintAta1Data);
       
        let vaultmintAtaData=svm.getAccount(vaultMintAta);
        let deserialisedVaultMintAtaData=borsh.deserialize(ataSchema,vaultmintAtaData?.data);
        console.log("vault mint ata account : ",deserialisedVaultMintAtaData);
    }),

    it("withdraw 50 mint tokens to mint ata1",()=>{
        console.log("mint ata : ",mintAta1.toBase58());
        console.log("vault mint ata : ",vaultMintAta.toBase58());
        
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey: userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey: mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey: mintAta1, isSigner:false, isWritable:true},
                {pubkey: vaultMintAta, isSigner:false, isWritable:true},
                {pubkey: vaultPda, isSigner:false, isWritable:false},
                {pubkey: spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([2,50,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAta1Data=svm.getAccount(mintAta1);
        let deserialisedMintAta1Data=borsh.deserialize(ataSchema,mintAta1Data?.data);
        console.log("mint ata1 account : ",deserialisedMintAta1Data);
       
        let vaultmintAtaData=svm.getAccount(vaultMintAta);
        let deserialisedVaultMintAtaData=borsh.deserialize(ataSchema,vaultmintAtaData?.data);
        console.log("vault mint ata account : ",deserialisedVaultMintAtaData);
    })
})