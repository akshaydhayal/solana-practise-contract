import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as spl from "@solana/spl-token";
import * as borsh from "borsh";
import * as mpl_token_metadata from "@metaplex-foundation/mpl-token-metadata";
 
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
spl.MintLayout
let mintSchema:borsh.Schema={
    struct:{
        mintAuthorityOption:'u32',
        mintAuthority:{array:{type:'u8',len:32}},
        supply:'u64',
        decimals:'u8',
        isInitialized:'u8',
        freezeAuthorityOption:'u32',
        freezeAuthority:{array:{type:'u8',len:32}}
    }
}

describe("token management tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let userAcc2:Keypair;
    let mintAcc:Keypair;
    let tokenMgmtProg:PublicKey;
    let mintAta:PublicKey;
    let mintAta2:PublicKey;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        userAcc2=Keypair.generate();
        mintAcc=Keypair.generate();
        tokenMgmtProg=PublicKey.unique();
        mintAta=spl.getAssociatedTokenAddressSync(mintAcc.publicKey,userAcc.publicKey);
        mintAta2=spl.getAssociatedTokenAddressSync(mintAcc.publicKey,userAcc2.publicKey);

        svm.addProgramFromFile(tokenMgmtProg,"../target/deploy/token_management.so");
        svm.addProgramFromFile(
        new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID),
        "./mpl_token_metadata.so"
        );
        svm.airdrop(userAcc.publicKey,BigInt(20*LAMPORTS_PER_SOL));
        svm.airdrop(userAcc2.publicKey,BigInt(20*LAMPORTS_PER_SOL));
    }),
    it("mint account create",()=>{
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([0,5])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc,mintAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAccData=svm.getAccount(mintAcc.publicKey);
        // console.log(mintAccData.data);
        if(mintAccData?.data){
            let d=borsh.deserialize(mintSchema,mintAccData.data);
            console.log(d);
        }
    }),
    it("create mint ata",()=>{
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1])
        })
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAtaData=svm.getAccount(mintAta);
        // console.log(mintAtaData?.data);
        if(mintAtaData?.data){
            let d1=borsh.deserialize(tokenSchema,mintAtaData.data);
            console.log(d1);
        }
    }),
    it("mint tokens",()=>{
        console.log("mint :",mintAcc.publicKey.toBase58());
        console.log("ata :",mintAta.toBase58());
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:true}, //try making false
                {pubkey:mintAta, isSigner:false, isWritable:true}, //try making false
                {pubkey:mintAta2, isSigner:false, isWritable:false}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([2,200,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAtaData=svm.getAccount(mintAta);
        // console.log(mintAtaData?.data);
        if(mintAtaData.data){
            let d1=borsh.deserialize(tokenSchema,mintAtaData.data);
            console.log("ATA Account : ",d1);
        }
        let mintAccData=svm.getAccount(mintAcc.publicKey);
        if(mintAccData?.data){
            let d=borsh.deserialize(mintSchema,mintAccData.data);
            console.log('Mint Account : ',d);
        }
    }),
    it("transfer to another ata",()=>{
        let ata2CreateIx=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc2.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta2, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:true}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1])
        })
        let tx=new Transaction().add(ata2CreateIx);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc2);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintAtaData=svm.getAccount(mintAta2);
        if(mintAtaData?.data){
            let d1=borsh.deserialize(tokenSchema,mintAtaData.data);
            console.log(d1);
        }


        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:true}, 
                {pubkey:mintAta, isSigner:false, isWritable:true}, 
                {pubkey:mintAta2, isSigner:false, isWritable:true}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([3,60,0,0,0,0,0,0,0])
        })
        let tx2=new Transaction().add(ix);
        tx2.recentBlockhash=svm.latestBlockhash();
        tx2.sign(userAcc);
        txStatus=svm.sendTransaction(tx2);
        console.log(txStatus.toString());

        let mintAta1Data=svm.getAccount(mintAta);
        if(mintAta1Data?.data){
            let d1=borsh.deserialize(tokenSchema,mintAta1Data.data);
            console.log("ata1 : ",d1);
        }
        
        let mintAta2Data=svm.getAccount(mintAta2);
        if(mintAta2Data?.data){
            let d1=borsh.deserialize(tokenSchema,mintAta2Data.data);
            console.log("ata2 : ",d1);
        }

    }),

    it("burn ata1 20 tokens",()=>{
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:true},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([4,10,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintData=svm.getAccount(mintAcc.publicKey);
        if(mintData?.data){
            let d=borsh.deserialize(mintSchema,mintData.data);
            console.log('mint account :',d);
        }
        let ata1Data=svm.getAccount(mintAta);
        if(ata1Data?.data){
            let d=borsh.deserialize(tokenSchema,ata1Data.data);
            console.log('ata1 account :',d);
        }
    }),
    it("freeze ata",()=>{
        console.log("ata ",mintAta.toBase58());
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([5])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let ata1Data=svm.getAccount(mintAta);
        if(ata1Data?.data){
            let d=borsh.deserialize(tokenSchema,ata1Data.data);
            console.log('ata1 account :',d);
        }
        if(ata1Data?.data){
            let d=borsh.deserialize(tokenSchema,ata1Data.data);
            console.log('ata1 accounttt :',d);
        }

        let transferIx=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false}, 
                {pubkey:mintAta, isSigner:false, isWritable:true}, 
                {pubkey:mintAta2, isSigner:false, isWritable:true}, 
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([3,60,0,0,0,0,0,0,0])
        })
        let tx2=new Transaction().add(transferIx);
        tx2.recentBlockhash=svm.latestBlockhash();
        tx2.sign(userAcc);
        txStatus=svm.sendTransaction(tx2);
        console.log(txStatus.toString());
    }),

    it("unfreeze ata",()=>{
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([6])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let ataData=svm.getAccount(mintAta);
        if(ataData?.data){
            let d=borsh.deserialize(tokenSchema,ataData.data);
            console.log('ata1 : ',d);
        }
    }),

    it("set ata1 account authority to token program",()=>{
        console.log("token prog :",spl.TOKEN_PROGRAM_ID.toBytes());
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:false, isWritable:false},
                {pubkey:mintAta, isSigner:false, isWritable:true},
                {pubkey:mintAta2, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([7])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let ataData=svm.getAccount(mintAta);
        if(ataData?.data){
            let d=borsh.deserialize(tokenSchema,ataData.data);
            console.log('ata1 : ',d);
        }
    }),

    it("set mint account authority to token program",()=>{
        console.log("token prog :",spl.TOKEN_PROGRAM_ID.toBase58());
        console.log("token prog :",spl.ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
        console.log("token prog :",mintAcc.publicKey.toBase58());
        console.log("token prog :",mintAta.toBase58());
        console.log("token prog :",mintAta2.toBase58());
        console.log("token prog :",userAcc.publicKey.toBase58());
        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:mintAta, isSigner:false, isWritable:false},
                {pubkey:mintAta2, isSigner:false, isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([8])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc,mintAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let ataData=svm.getAccount(mintAcc.publicKey);
        if(ataData?.data){
            let d=borsh.deserialize(mintSchema,ataData.data);
            console.log('ata1 : ',d);
        }
    }),

    it("setting tken metadata",()=>{
        let metadataSchema:borsh.Schema={
            struct:{
                type:'u8',
                updateAuthority:{array:{type:'u8',len:32}},
                mint:{array:{type:'u8',len:32}},
                name:'string',
                symbol:'string',
                uri:'string'
            }
        }
        let [mint_metadata_pda,bump]=PublicKey.findProgramAddressSync([
            Buffer.from("metadata"),
            new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            mintAcc.publicKey.toBuffer(),
        ],new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID));
        console.log("mpl metadata pda : ",mint_metadata_pda);
        console.log("mpl program key : ",new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID).toBase58());
        console.log("mpl metadata pda : ",new PublicKey(mint_metadata_pda).toBase58());

        let ix=new TransactionInstruction({
            programId:tokenMgmtProg,
            keys:[
                {pubkey:userAcc.publicKey,isSigner:true,isWritable:false},
                {pubkey:mintAcc.publicKey,isSigner:false,isWritable:false},
                {pubkey:new PublicKey(mint_metadata_pda),isSigner:false,isWritable:true},
                {pubkey:mintAta,isSigner:false,isWritable:false},
                {pubkey:mintAta2,isSigner:false,isWritable:false},
                {pubkey:spl.TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
                {pubkey:SystemProgram.programId,isSigner:false,isWritable:false},
                {pubkey:SYSVAR_RENT_PUBKEY,isSigner:false,isWritable:false},
                {pubkey:spl.ASSOCIATED_TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
                {pubkey:new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID),isSigner:false,isWritable:false},

            ],
            data:Buffer.from([9])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let mintMetadataPdaData=svm.getAccount(mint_metadata_pda);
        console.log("mint metadata pda",mintMetadataPdaData?.data);
        if(mintMetadataPdaData?.data){
            let d=borsh.deserialize(metadataSchema,mintMetadataPdaData?.data);
            console.log(d);
        }

        let mpl_program_data=svm.getAccount(new PublicKey(mpl_token_metadata.MPL_TOKEN_METADATA_PROGRAM_ID));
        console.log("mpl program detail: ",mpl_program_data?.data.length);
        console.log("mpl program detail: ",mpl_program_data?.lamports);
        console.log("mpl program detail: ",mpl_program_data?.owner);
        console.log("mpl program detail: ",mpl_program_data?.executable);
    })
})