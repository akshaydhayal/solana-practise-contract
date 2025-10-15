import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as spl from "@solana/spl-token";
import * as borsh from "borsh";

spl.MintLayout;
let mintSchema:borsh.Schema={
    struct:{
        mintAuthorityOption:'u32',
        mintAuthority:{array:{type:'u8',len:32}},
        supply:'u64',
        decimals:'u8',
        isInitialized:'bool',
        closeAuthorityOption:'u32',
        freezeAuthority:{array:{type:'u8',len:32}}
    }
}
// 32*4+8+8+1+8
spl.AccountLayout;
let tokenSchema:borsh.Schema={
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
let escrowPdaSchema:borsh.Schema={
    struct:{
        owner:{array:{type:'u8',len:32}},
        initialiser:{array:{type:'u8',len:32}},
        taker:{array:{type:'u8',len:32}},
        initialiser_ata_x:{array:{type:'u8',len:32}},
        initialiser_ata_y:{array:{type:'u8',len:32}},
        amount_x:'u64',
        amount_y:'u64',
        taker_ata_x:{array:{type:'u8',len:32}},
        taker_ata_y:{array:{type:'u8',len:32}},
        state:'u8',
        expiryTime:'u64'
    }
};

describe("escrow teting",()=>{
    let svm:LiteSVM;
    let initialiser:Keypair;
    let taker:Keypair;
    let escrowPda:PublicKey;
    let escrowProg:PublicKey;
    let bump:number;

    let mintX:Keypair;
    let mintY:Keypair;

    let initialiserXAta:PublicKey;
    let initialiserYAta:PublicKey;

    let takerXAta:PublicKey;
    let takerYAta:PublicKey;
    
    let escrowPdaAtaX:PublicKey;
    let escrowPdaAtaY:PublicKey;


    beforeAll(()=>{
        svm=new LiteSVM();
        initialiser=Keypair.generate();
        taker=Keypair.generate();
        escrowProg=PublicKey.unique();
        svm.addProgramFromFile(escrowProg,"../target/deploy/escrow.so");
        svm.airdrop(initialiser.publicKey,BigInt(10*LAMPORTS_PER_SOL));
        svm.airdrop(taker.publicKey,BigInt(10*LAMPORTS_PER_SOL));

        [escrowPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("escrow"), 
            Buffer.from([99,0,0,0,0,0,0,0])],escrowProg);
            // initialiser.publicKey.toBuffer()],escrowProg);

        mintX=Keypair.generate();
        mintY=Keypair.generate();
        
        let mintXcreateIx=SystemProgram.createAccount({
            fromPubkey:initialiser.publicKey, newAccountPubkey:mintX.publicKey,
            lamports:Number(svm.minimumBalanceForRentExemption(BigInt(82))),
            space:82, programId:spl.TOKEN_PROGRAM_ID
        });
        let mintYcreateIx=SystemProgram.createAccount({
            fromPubkey:initialiser.publicKey, newAccountPubkey:mintY.publicKey,
            lamports:Number(svm.minimumBalanceForRentExemption(BigInt(82))),
            space:82, programId:spl.TOKEN_PROGRAM_ID
        });
        let tx=new Transaction().add(mintXcreateIx,mintYcreateIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(initialiser, mintX, mintY);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        svm.expireBlockhash();

        let initMintxIx=spl.createInitializeMint2Instruction(mintX.publicKey,
            5,initialiser.publicKey,initialiser.publicKey,spl.TOKEN_PROGRAM_ID
        );
        let initMintyIx=spl.createInitializeMint2Instruction(mintY.publicKey,
            6,taker.publicKey,taker.publicKey,spl.TOKEN_PROGRAM_ID
        );
        tx=new Transaction().add(initMintxIx,initMintyIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(initialiser);
        txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintxData=svm.getAccount(mintX.publicKey);
        let mintxDeserialisedData=borsh.deserialize(mintSchema,mintxData?.data);
        console.log("mint x : ",mintxDeserialisedData);

        let mintyData=svm.getAccount(mintY.publicKey);
        let mintyDeserialisedData=borsh.deserialize(mintSchema,mintyData?.data);
        console.log("mint y : ",mintyDeserialisedData);

        initialiserXAta=spl.getAssociatedTokenAddressSync(mintX.publicKey,initialiser.publicKey);
        takerXAta=spl.getAssociatedTokenAddressSync(mintX.publicKey,taker.publicKey);

        initialiserYAta=spl.getAssociatedTokenAddressSync(mintY.publicKey,initialiser.publicKey);
        takerYAta=spl.getAssociatedTokenAddressSync(mintY.publicKey,taker.publicKey);
        
        let initialiserXAtaIx=spl.createAssociatedTokenAccountInstruction(initialiser.publicKey,
            initialiserXAta,initialiser.publicKey,mintX.publicKey,spl.TOKEN_PROGRAM_ID);
        let initialiserYAtaIx=spl.createAssociatedTokenAccountInstruction(initialiser.publicKey,
            initialiserYAta,initialiser.publicKey,mintY.publicKey,spl.TOKEN_PROGRAM_ID);
       
        let takerXAtaIx=spl.createAssociatedTokenAccountInstruction(taker.publicKey,
            takerXAta,taker.publicKey,mintX.publicKey,spl.TOKEN_PROGRAM_ID);
        let takerYAtaIx=spl.createAssociatedTokenAccountInstruction(taker.publicKey,
            takerYAta,taker.publicKey,mintY.publicKey,spl.TOKEN_PROGRAM_ID);

        tx=new Transaction().add(initialiserXAtaIx,initialiserYAtaIx,takerXAtaIx,takerYAtaIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(initialiser,taker);
        txStatus=svm.sendTransaction(tx);        
        console.log(txStatus.toString());
        
        
        //now minting tokens to atax of initialser and atay of taker
        console.log("minting tokens to initialiser atax and taker atay");
        let mintToInitialiserXAtaIx=spl.createMintToInstruction(mintX.publicKey,initialiserXAta,
            initialiser.publicKey, 200);
            let mintToTakerYAtaIx=spl.createMintToInstruction(mintY.publicKey,takerYAta,
            taker.publicKey, 150);
            tx=new Transaction().add(mintToInitialiserXAtaIx,mintToTakerYAtaIx);
            tx.recentBlockhash=svm.latestBlockhash();
            tx.sign(initialiser,taker);
            
            txStatus=svm.sendTransaction(tx);
            console.log(txStatus.toString());

            let initialiserXAtaData=svm.getAccount(initialiserXAta);
            let initialiserXAtaDeserialisedData=borsh.deserialize(tokenSchema,initialiserXAtaData?.data);
            console.log("Initialiser X ATA Account :",initialiserXAtaDeserialisedData);
          
            let takerYAtaData=svm.getAccount(takerYAta);
            let takerYAtaDeserialisedData=borsh.deserialize(tokenSchema,takerYAtaData?.data);
            console.log("taker Y ATA Account :",takerYAtaDeserialisedData);

            escrowPdaAtaY=spl.getAssociatedTokenAddressSync(mintY.publicKey,escrowPda,true);
            escrowPdaAtaX=spl.getAssociatedTokenAddressSync(mintX.publicKey,escrowPda,true);
    }),

    it("vault init",()=>{
        let ix=new TransactionInstruction({
            programId:escrowProg,
            keys:[
                {pubkey:initialiser.publicKey, isSigner:true, isWritable:true},
                {pubkey:escrowPda, isSigner:false, isWritable:true},
                {pubkey:mintX.publicKey, isSigner:false, isWritable:true},
                {pubkey:initialiserXAta, isSigner:false, isWritable:true},
                {pubkey:initialiserYAta, isSigner:false, isWritable:false},
                {pubkey:escrowPdaAtaX, isSigner:false, isWritable:true},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([
                0,
                10,0,0,0,0,0,0,0,
                15,0,0,0,0,0,0,0,
                99,0,0,0,0,0,0,0,
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(initialiser);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let escrowPdaData=svm.getAccount(escrowPda);
        let deserialisedEscrowPdaData=borsh.deserialize(escrowPdaSchema,escrowPdaData?.data);
        console.log("Escrow Pda Acc : ",deserialisedEscrowPdaData);

        let escrowPdaAtaXData=svm.getAccount(escrowPdaAtaX);
        let deserialisedEscrowPdaAtaXData=borsh.deserialize(tokenSchema,escrowPdaAtaXData?.data);
        console.log("Escrow Pda ata x Acc : ",deserialisedEscrowPdaAtaXData);

        let initialiserAtaXData=svm.getAccount(initialiserXAta);
        let deserialisedInitialiserAtaXData=borsh.deserialize(tokenSchema,initialiserAtaXData?.data);
        console.log("Initialiser ata x Acc : ",deserialisedInitialiserAtaXData);
    }),

    it("accept escrow offer",()=>{
        console.log('escrowPdaAtaY : ',taker.publicKey.toBase58());
        console.log('escrowPdaAtaY : ',escrowPda.toBase58());
        console.log('escrowPdaAtaY : ',mintY.publicKey.toBase58());
        console.log('escrowPdaAtaY : ',escrowPdaAtaX.toBase58());
        console.log('escrowPdaAtaY : ',escrowPdaAtaY.toBase58());
        console.log('escrowPdaAtaY : ',initialiserXAta.toBase58());
        console.log('escrowPdaAtaY : ',initialiserYAta.toBase58());
        console.log('escrowPdaAtaY : ',takerXAta.toBase58());
        console.log('escrowPdaAtaY : ',takerYAta.toBase58());
        let ix=new TransactionInstruction({
            programId:escrowProg,
            keys:[
                {pubkey:taker.publicKey, isSigner:true, isWritable:true},
                {pubkey:escrowPda, isSigner:false, isWritable:true},
                {pubkey:mintY.publicKey, isSigner:false, isWritable:false},

                {pubkey:escrowPdaAtaX, isSigner:false, isWritable:true},
                {pubkey:escrowPdaAtaY, isSigner:false, isWritable:true},
                {pubkey:initialiserXAta, isSigner:false, isWritable:true},
                {pubkey:initialiserYAta, isSigner:false, isWritable:true},

                {pubkey:takerXAta, isSigner:false, isWritable:true},
                {pubkey:takerYAta, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([
                1,
                99,0,0,0,0,0,0,0
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(taker);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        console.log("escrow pda pubkey :",escrowPda.toBytes());
        console.log("taker pubkey :",taker.publicKey.toBytes());
        let escrowPdaData=svm.getAccount(escrowPda);
        let deserialisedEscrowPdaData=borsh.deserialize(escrowPdaSchema,escrowPdaData?.data);
        console.log("Escrow pda account : ",deserialisedEscrowPdaData);

        let escrowPdaAtaYData=svm.getAccount(escrowPdaAtaY);
        let deserialisedEscrowPdaAtaYData=borsh.deserialize(tokenSchema,escrowPdaAtaYData?.data);
        console.log("Escrow pda ata y account : ",deserialisedEscrowPdaAtaYData);
        
        let takerAtaYData=svm.getAccount(takerYAta);
        let deserialisedTakerAtaYData=borsh.deserialize(tokenSchema,takerAtaYData?.data);
        console.log("Taker ata y account : ",deserialisedTakerAtaYData);

        let initialiserAtaYData=svm.getAccount(initialiserYAta);
        let deserialisedInitialiserAtaYData=borsh.deserialize(tokenSchema,initialiserAtaYData?.data);
        console.log("Initialiser ata y account : ",deserialisedInitialiserAtaYData);

        
    })
})