import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";

describe("tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let counterProg:PublicKey;
    let counterPda:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        counterProg=PublicKey.unique();
        svm.addProgramFromFile(counterProg,"../../target/deploy/program.so");
        svm.airdrop(userAcc.publicKey,BigInt(5*LAMPORTS_PER_SOL));
        [counterPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("counter"),userAcc.publicKey.toBuffer()],counterProg);
    }),
    it("init counter",()=>{
        let ix=new TransactionInstruction({
            programId:counterProg,
            keys:[
                {pubkey:userAcc.publicKey, isWritable:true, isSigner:true},
                {pubkey:counterPda, isWritable:true, isSigner:false},
                {pubkey:SystemProgram.programId, isWritable:false, isSigner:false},
            ],
            data:Buffer.from([0,4,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
        
        let counterpdaData=svm.getAccount(counterPda);
        console.log(counterpdaData?.data);


    })
})