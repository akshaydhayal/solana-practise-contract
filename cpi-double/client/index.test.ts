import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";

describe("cpi on double ",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let doublePda:PublicKey;
    let system:PublicKey;
    let doubleProgram:PublicKey;
    let cpiProgram:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        doubleProgram=PublicKey.unique();
        cpiProgram=PublicKey.unique();
        system=SystemProgram.programId;

        svm.addProgramFromFile(cpiProgram,"./cpi_double.so");
        svm.addProgramFromFile(doubleProgram,"./double.so");
        svm.airdrop(userAcc.publicKey,BigInt(1*LAMPORTS_PER_SOL));
        [doublePda,bump]=PublicKey.findProgramAddressSync([Buffer.from("double"),userAcc.publicKey.toBuffer()],doubleProgram);
    }),
    it("cpi init to double program",()=>{
        let ix=new TransactionInstruction({
            programId:cpiProgram,
            keys:[
                {pubkey:userAcc.publicKey, isWritable:true, isSigner:true},
                {pubkey:doublePda, isWritable:true, isSigner:false},
                {pubkey:doubleProgram, isWritable:false, isSigner:false},
                {pubkey:SystemProgram.programId, isWritable:false, isSigner:false},
            ],
            data:Buffer.from([0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let doublePdaData=svm.getAccount(doublePda);
        console.log(doublePdaData?.data);
    }),
    it("double 3 times 1 becomes 8",()=>{
        function double(){
            let ix=new TransactionInstruction({
                programId:cpiProgram,
                keys:[
                    {pubkey:userAcc.publicKey, isWritable:true, isSigner:true},
                    {pubkey:doublePda, isWritable:true, isSigner:false},
                    {pubkey:doubleProgram, isWritable:false, isSigner:false},
                    {pubkey:SystemProgram.programId, isWritable:false, isSigner:false},
                ],
                data:Buffer.from([1])
            });
            let tx=new Transaction().add(ix);
            tx.recentBlockhash=svm.latestBlockhash();
            tx.sign(userAcc);
            let txStatus=svm.sendTransaction(tx);
            svm.expireBlockhash();
        }
        double();
        double();
        double();
        let doublePdaData=svm.getAccount(doublePda);
        console.log(doublePdaData?.data);
    }),
    it("halving value 8 two time make it 2",()=>{
        function half(){
            let ix=new TransactionInstruction({
                programId:cpiProgram,
                keys:[
                    {pubkey:userAcc.publicKey, isWritable:true, isSigner:true},
                    {pubkey:doublePda, isWritable:true, isSigner:false},
                    {pubkey:doubleProgram, isWritable:false, isSigner:false},
                    {pubkey:SystemProgram.programId, isWritable:false, isSigner:false},
                ],
                data:Buffer.from([2])
            });
            let tx=new Transaction().add(ix);
            tx.recentBlockhash=svm.latestBlockhash();
            tx.sign(userAcc);
            let txStatus=svm.sendTransaction(tx);
            svm.expireBlockhash();
        }
        half();
        half();
        let doublePdaData=svm.getAccount(doublePda);
        console.log(doublePdaData?.data);
    })
})