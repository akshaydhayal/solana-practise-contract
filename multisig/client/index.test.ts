import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as borsh from "borsh";
import * as borsh2 from '@coral-xyz/borsh'

class MultisigInitClass{
    owner1:number[];
    owner2:number[];
    owner3:number[];
    owner4:number[];
    owner5:number[];
    threshold:number;
    constructor(owner1:number[],owner2:number[],owner3:number[],owner4:number[],owner5:number[],threshold:number){
        this.owner1=owner1;
        this.owner2=owner2;
        this.owner3=owner3;
        this.owner4=owner4;
        this.owner5=owner5;
        this.threshold=threshold;
    }
}
let initMultisigSchmea:borsh.Schema={
    struct:{
        owner1:{array:{type:'u8',len:32}},
        owner2:{array:{type:'u8',len:32}},
        owner3:{array:{type:'u8',len:32}},
        owner4:{array:{type:'u8',len:32}},
        owner5:{array:{type:'u8',len:32}},
        threshold:'u8'
    }
}


let createWithdrawProposalSchema:borsh.Schema={
    struct:{
        reciever:{array:{type:'u8',len:32}},
        amount:'u64'
    }
}
class CreateWithdrawProposalClass{
    reciever:number[];
    amount:number;
    constructor(reciever:number[],amount:number){
        this.reciever=reciever;
        this.amount=amount;
    }
}

describe("multisig tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let userAcc2:Keypair;
    let multisigProg:PublicKey;
    let multisigPda:PublicKey;
    let vaultPda:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        userAcc2=Keypair.generate();
        multisigProg=PublicKey.unique();

        // [multisigPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("multisig"),userAcc.publicKey.toBuffer()],multisigProg);
        [multisigPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("multisig")],multisigProg);
        [vaultPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("vault")],multisigProg);

        svm.addProgramFromFile(multisigProg,"../target/deploy/multisig.so");
        svm.airdrop(userAcc.publicKey,BigInt(5*LAMPORTS_PER_SOL));
        svm.airdrop(userAcc2.publicKey,BigInt(5*LAMPORTS_PER_SOL));
    }),

    it("multisig init ",()=>{
        let initMultisigSerialisedData=borsh.serialize(initMultisigSchmea, new MultisigInitClass(
            Array.from(userAcc.publicKey.toBytes()),
            Array.from(userAcc2.publicKey.toBytes()),
            Array.from(userAcc.publicKey.toBytes()),
            Array.from(userAcc.publicKey.toBytes()),
            Array.from(userAcc.publicKey.toBytes()),
            2
        ))
        console.log("serialised data in client",initMultisigSerialisedData);
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:multisigPda, isSigner:false, isWritable:true},
                {pubkey:vaultPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data: Buffer.concat([
                Buffer.from([0]),initMultisigSerialisedData
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);
    }),
    it("deposit to multisig vault",()=>{
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isWritable:true,isSigner:true},
                {pubkey:multisigPda, isWritable:true,isSigner:false},
                {pubkey:vaultPda, isWritable:true,isSigner:false},
                {pubkey:SystemProgram.programId, isWritable:false,isSigner:false},
            ],
            data:Buffer.from([1,100,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let vaultPdaData=svm.getAccount(vaultPda);
        console.log(vaultPdaData?.data);
        console.log(vaultPdaData?.lamports);
    }),

    it("create withdraw proposal",()=>{
        let ix_data=borsh.serialize(createWithdrawProposalSchema,new CreateWithdrawProposalClass(
            Array.from(userAcc.publicKey.toBytes()),
            50
        ));
        console.log("create proposal ix data",ix_data);
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isWritable:true,isSigner:true},
                {pubkey:multisigPda, isWritable:true,isSigner:false},
                {pubkey:vaultPda, isWritable:true,isSigner:false},
                {pubkey:SystemProgram.programId, isWritable:false,isSigner:false},
            ],
            data:Buffer.concat([
                Buffer.from([2]),ix_data
            ])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);

        if(multisigPdaData?.data){
            let d=borsh.deserialize(multisigSchema,multisigPdaData.data);
            console.log(d);
        }
    }),

    it("approve a proposal",()=>{
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc2.publicKey, isSigner:true, isWritable: true},
                {pubkey:multisigPda, isSigner:false, isWritable: true},
                {pubkey:vaultPda, isSigner:false, isWritable: true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable: false},
            ],
            data:Buffer.from([3,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc2);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
    

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);
        if(multisigPdaData?.data){
            let deserData=borsh.deserialize(multisigSchema,multisigPdaData.data);
            console.log(deserData);
        }
    }),

    it("claim withdraw proposal",()=>{
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable: true},
                {pubkey:multisigPda, isSigner:false, isWritable: true},
                {pubkey:vaultPda, isSigner:false, isWritable: true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable: false},
            ],
            data:Buffer.from([4,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
    

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);
        if(multisigPdaData?.data){
            let deserData=borsh.deserialize(multisigSchema,multisigPdaData.data);
            console.log(deserData);
        }
    }),
    it("claim2 withdraw proposal",()=>{
        svm.expireBlockhash();
        let ix=new TransactionInstruction({
            programId:multisigProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable: true},
                {pubkey:multisigPda, isSigner:false, isWritable: true},
                {pubkey:vaultPda, isSigner:false, isWritable: true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable: false},
            ],
            data:Buffer.from([4,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());
    

        let multisigPdaData=svm.getAccount(multisigPda);
        console.log(multisigPdaData?.data);
        if(multisigPdaData?.data){
            let deserData=borsh.deserialize(multisigSchema,multisigPdaData.data);
            console.log(deserData);
        }
    })
})










let proposalSchema:borsh.Schema={
    struct:{
        reciever:{array:{type:'u8',len:32}},
        amount:'u64',
        //again errors in derserialising ddata when en is mentioned as there is len buffer data in 
        // byte data and if len is mentioned then that len size in buffer is used in other fileds instead for len field
        // approvals:{array:{type:'bool',len:5}},
        approvals:{array:{type:'bool'}},
        executed:'bool'
    } 
};
let multisigSchema:borsh.Schema={
    struct:{
        owner1:{array:{type:'u8',len:32}},
        owner2:{array:{type:'u8',len:32}},
        owner3:{array:{type:'u8',len:32}},
        owner4:{array:{type:'u8',len:32}},
        owner5:{array:{type:'u8',len:32}},
        threshold:'u8',
        proposals:{array:{type:proposalSchema}}

        //there is differnece between above and below line, for vectors use above, don't mention len ,
        //use len for pubkeys only whocha re normal arrays and not vectors
        // proposals:{array:{type:proposalSchema,len:1}}
    }
};