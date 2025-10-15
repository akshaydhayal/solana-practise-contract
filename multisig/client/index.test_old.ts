import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as borsh from "borsh";
import * as borsh2 from '@coral-xyz/borsh'


class MultisigInitClass{
    owners:number[][];
    threshold:number;
    names:string[];
    constructor(owners:number[][],threshold:number,names:string[]){
        this.owners=owners;
        this.threshold=threshold;
        this.names=names;
    }
}

let initMultisigSchema:borsh.Schema={
    struct:{
        names:{array:{type:'string',len:2}},
        owners:
        {
            array:{
                type:{array:{type:'u8',len:32}},
                len:1
            }
        },
        threshold:'u8'
    }
}

let initMultisigAccSchema:borsh.Schema={
    struct:{
        owners:
        {
            array:{
                type:{array:{type:'u8',len:32}},
                len:1
            }
        },
        threshold:'u8',
        // names:{array:{type:'string',len:2}},
        // threshold2:'u8',
        // proposals:{array:{type:'u8',len:0}}
    }
}

describe("multisig tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let multisigProg:PublicKey;
    let multisigPda:PublicKey;
    let vaultPda:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        multisigProg=PublicKey.unique();
        [multisigPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("multisig"),userAcc.publicKey.toBuffer()],multisigProg);
        [vaultPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("vault")],multisigProg);

        svm.addProgramFromFile(multisigProg,"../target/deploy/multisig.so");
        svm.airdrop(userAcc.publicKey,BigInt(5*LAMPORTS_PER_SOL));
    }),

    it("multisig init ",()=>{
        let initMultisigSerialisedData=borsh.serialize(
            initMultisigSchema, 
            new MultisigInitClass(
                [Array.from(userAcc.publicKey.toBytes())],
                3, ["a","b"]
            )
        );
        console.log("serialised data in client",initMultisigSerialisedData);
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:multisigPda, isSigner:false, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data: Buffer.from([
                0,
                1, 0, 0, 0, 139, 23, 119, 55, 207, 218, 121, 169, 138, 17, 80, 180, 10, 241, 126, 34, 91, 244, 69, 112, 67, 142, 102, 140, 117, 104, 185, 199, 171, 222, 89, 157,
                3,
                2, 0, 0, 0, 1, 0, 0, 0, 97, 1, 0, 0, 0, 98
            ])
            // Buffer.concat([
            //     Buffer.from([0]), initMultisigSerialisedData
            // ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);

        if(multisigPdaData?.data){
            let d=borsh.deserialize(initMultisigAccSchema,multisigPdaData.data);
            console.log(d);
        }
    })
})
