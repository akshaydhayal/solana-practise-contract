import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { LiteSVM } from "litesvm";
import * as borsh from "borsh";
import { useReducer } from "react";

class InitPoll{
    poll_id:number;
    title:string;
    options:string[];
    votes:number[];
    constructor(poll_id:number,title:string,options:string[],votes:number[]){
        this.poll_id=poll_id;
        this.title=title;
        this.options=options;
        this.votes=votes;
    }
}
let initSchema:borsh.Schema={
    struct:{
        poll_id:'u32',
        title:'string',
        options:{array:{type:'string'}},
        votes:{array:{type:'u32'}},
    }
}

class VoteClass{
    poll_id:number;
    option_id:number;
    constructor(poll_id:number,option_id:number){
        this.poll_id=poll_id;
        this.option_id=option_id;
    }
}
let voteSchema:borsh.Schema={
    struct:{
        poll_id:'u32',
        option_id:'u32',
        // voter:{array:{type:'u8',len:32}}
    }
}

describe("vote tests",()=>{
    let svm:LiteSVM;
    let userAcc:Keypair;
    let voteProgram:PublicKey;
    let pollPda:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSVM();
        userAcc=Keypair.generate();
        voteProgram=PublicKey.unique();

        svm.addProgramFromFile(voteProgram,"../target/deploy/vote.so");
        svm.airdrop(userAcc.publicKey,BigInt(5*LAMPORTS_PER_SOL));
    }),
    it("init poll",()=>{
        [pollPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("poll"), Buffer.from([1,0,0,0])],voteProgram);
        console.log("pda in tests: ",pollPda.toBase58());

        let serialisedData=borsh.serialize(initSchema,
            new InitPoll(1,"Kohli vs Rohit?",["a","b","c","d"],[0,0,0,0]));
        let ix=new TransactionInstruction({
            programId:voteProgram,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:pollPda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.concat([Buffer.from([0]), serialisedData])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        let txStatus=svm.sendTransaction(tx);
        console.log(txStatus.toString());

        let pollData=svm.getAccount(pollPda);
        console.log(pollData?.data);
        if(pollData?.data){
            let deserialisedData=borsh.deserialize(initSchema,pollData.data);
            console.log(deserialisedData);
        }
    }),

    it("vote on a poll",()=>{
        function vote(option_id:number, voter:Keypair){
            [pollPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("poll"), Buffer.from([1,0,0,0])],voteProgram);
            
            let serialisedData=borsh.serialize(voteSchema,
                new VoteClass(1, option_id));
            let ix=new TransactionInstruction({
                programId:voteProgram,
                keys:[
                    {pubkey:voter.publicKey, isSigner:true, isWritable:true},
                    {pubkey:pollPda, isSigner:false, isWritable:true},
                    {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
                ],
                data:Buffer.concat([Buffer.from([1]),serialisedData])
            });

            let tx=new Transaction().add(ix);
            tx.recentBlockhash=svm.latestBlockhash();
            tx.sign(voter);
            let txStatus=svm.sendTransaction(tx);
            svm.expireBlockhash();
            console.log(txStatus.toString());
        }
        let user2=Keypair.generate();
        svm.airdrop(user2.publicKey,BigInt(5*LAMPORTS_PER_SOL));
        vote(0,userAcc);
        vote(3,user2);

        let pollPdaData=svm.getAccount(pollPda);
        console.log(pollPdaData?.data);
        if(pollPdaData?.data){
            let deserialisedData=borsh.deserialize(initSchema,pollPdaData.data);
            console.log(deserialisedData);
        }
    })
})



