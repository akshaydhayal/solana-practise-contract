import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";

describe("vault basic test",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let vaultPda:PublicKey;
    let vaultProgram:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        vaultProgram=PublicKey.unique();
        [vaultPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("vault"),userAcc.publicKey.toBuffer()],vaultProgram);
        svm.addProgramFromFile(vaultProgram,"../target/deploy/vault_basic.so");
        svm.airdrop(userAcc.publicKey,BigInt(10*LAMPORTS_PER_SOL));
    }),
    it("vault pda init",()=>{
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        
        let vaultPdaData=svm.getAccount(vaultPda);
        console.log('vault lamports : ',vaultPdaData?.lamports);
        console.log(vaultPdaData?.data);
    }),
    it("deposit 55 lamports to vault pda",()=>{
        let userData=svm.getAccount(userAcc.publicKey);
        console.log('before depsoit user Bal : ',userData?.lamports);
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1,55,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let vaultPdaData=svm.getAccount(vaultPda);
        console.log(vaultPdaData?.data);
        console.log('vault lamports : ',vaultPdaData?.lamports);
        userData=svm.getAccount(userAcc.publicKey);
        console.log('after deposit user bal : ',userData?.lamports);
    }),
    it("withdraw 50 lamports from vault pda to user",()=>{
        let ix=new TransactionInstruction({
            programId:vaultProgram,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([2,50,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        
        let vaultPdaData=svm.getAccount(vaultPda);
        console.log(vaultPdaData?.data);
        console.log('vault lamports : ',vaultPdaData?.lamports);
        let userData=svm.getAccount(userAcc.publicKey);
        console.log('after withdraw user bal : ',userData?.lamports);
    })
})