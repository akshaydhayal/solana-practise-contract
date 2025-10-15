import { ComputeBudgetInstruction, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {beforeAll, describe, it} from "bun:test";
import { Clock, ComputeBudget, LiteSvm } from "litesvm/dist/internal";
import * as borsh from "borsh";

let stakeSchema:borsh.Schema={
    struct:{
        staker:{array:{type:'u8',len:32}},
        withdrawAuthority:{array:{type:'u8',len:32}},
        delegatedVote:{array:{type:'u8',len:32}},
        points:'i64',
        stakes:{array:{
            type:{struct:{stakeAmount:'u64',stakeTime:'i64'}}
        }},
        unstakes:{array:{
            type:{struct:{unstakeAmount:'u64',unstakeTime:'i64'}}
        }}
    }
}

describe("stake tests",()=>{
    let svm:LiteSvm;
    let clock:Clock;
    let userAcc:Keypair;
    let stakeProg:PublicKey;
    let stakePda:PublicKey;
    let bump:number;

    beforeAll(()=>{
        svm=new LiteSvm();
        clock=new Clock(BigInt(101),BigInt(10010),BigInt(67),BigInt(567),BigInt(2000));
        svm.setClock(clock);
        let c=svm.getClock();
        console.log("unix timestamp : ",c.unixTimestamp, "slot : ",c.slot);

        userAcc=Keypair.generate();
        stakeProg=PublicKey.unique();
        svm.addProgramFromFile(stakeProg.toBytes(),"../target/deploy/stake.so");
        svm.airdrop(userAcc.publicKey.toBytes(),BigInt(5*LAMPORTS_PER_SOL));

        [stakePda,bump]=PublicKey.findProgramAddressSync([Buffer.from("stake"),userAcc.publicKey.toBuffer()],stakeProg);
    }),
    it("init stake account",()=>{
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([0,bump])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);

        let txBytes=tx.serialize();
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus);

        let stakePdaData=svm.getAccount(stakePda.toBytes());
        console.log(stakePdaData?.data());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log("stake pda : ",deserialisedStakePdaData);
    }),
    it("stake1",()=>{
        console.log("staking 100 lamports, stake1");
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1,100,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        
        let txBytes=tx.serialize();
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString());
        
        let stakePdaData=svm.getAccount(stakePda.toBytes());
        console.log(stakePdaData?.data());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log('stake pda : ',deserialisedStakePdaData);

    }),
    it("stake2",()=>{
        svm.expireBlockhash();
        console.log("stakeing 10 lamports, stake2");
        let clockForStake2=new Clock(BigInt(500),BigInt(500),BigInt(500),BigInt(500),BigInt(3000));
        svm.setClock(clockForStake2);
        console.log("clock time for stake 2 : ",svm.getClock().unixTimestamp);
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                    {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([1,80,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        // 23000/11 =209
        let txBytes=tx.serialize();
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString());

        let stakePdaData=svm.getAccount(stakePda.toBytes());
        console.log(stakePdaData?.data());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log('stake pda after stake2 : ',deserialisedStakePdaData);
    }),
    it("unstake1",()=>{
        console.log("bump : ",bump);
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([2,bump,90,0,0,0,0,0,0,0])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        
        let txBytes=tx.serialize();
        
        let clock=new Clock(BigInt(401),BigInt(401),BigInt(401),BigInt(401),BigInt(3500));
        svm.setClock(clock);
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString());

        let stakePdaData=svm.getAccount(stakePda.toBytes());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log("stake pda : ",deserialisedStakePdaData);
    }),
    it("unstake2",()=>{
        console.log("bump : ",bump);
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([2,bump,8,0,0,0,0,0,0,0])
        });
        let compute=new ComputeBudget();
        let cix=new ComputeBudgetInstruction();
        console.log(cix);
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);

        let txBytes=tx.serialize();
    
        let clock=new Clock(BigInt(401),BigInt(401),BigInt(401),BigInt(401),BigInt(3600));
        svm.setClock(clock);
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString());
        
        let stakePdaData=svm.getAccount(stakePda.toBytes());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log("stake pda : ",deserialisedStakePdaData);
        console.log("stake pda bal : ",stakePdaData?.lamports());
    }),
    it("withdraw unstaked amount",()=>{
        console.log("bump : ",bump);
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([3,bump])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        
        let txBytes=tx.serialize();
        
        let clock=new Clock(BigInt(401),BigInt(401),BigInt(401),BigInt(401),BigInt(7100));
        svm.setClock(clock);
        console.log("time : ",svm.getClock().unixTimestamp);
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString());
        
        let stakePdaData=svm.getAccount(stakePda.toBytes());
        let deserialisedStakePdaData=borsh.deserialize(stakeSchema,stakePdaData?.data());
        console.log("stake pda : ",deserialisedStakePdaData);
        console.log("stake pda bal : ",stakePdaData?.lamports());
    }),
    it("close stake account to claim rent",()=>{
        let stakePdaData=svm.getAccount(stakePda.toBytes());
        console.log('stake pda lamports before delete : ',stakePdaData?.lamports());
        let userData=svm.getAccount(userAcc.publicKey.toBytes());
        console.log('user lamports before delete : ',userData?.lamports());
        console.log("system program : ",SystemProgram.programId.toBase58());
        console.log("stake program : ",stakeProg.toBase58());
        
        let ix=new TransactionInstruction({
            programId:stakeProg,
            keys:[
                {pubkey:userAcc.publicKey, isSigner:true, isWritable:true},
                {pubkey:stakePda, isSigner:false, isWritable:true},
                {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
            ],
            data:Buffer.from([4,bump])
        });
        let tx=new Transaction().add(ix);
        tx.recentBlockhash=svm.latestBlockhash();
        tx.sign(userAcc);
        
        let txBytes=tx.serialize();
        let txStatus=svm.sendLegacyTransaction(txBytes);
        console.log(txStatus.toString())
        
        stakePdaData=svm.getAccount(stakePda.toBytes());
        console.log('stake pda lamports after delete : ',stakePdaData?.lamports());
        console.log('stake pda len : ',stakePdaData?.data().length);
        console.log('stake pda owner : ',stakePdaData?.owner());
        let x=new PublicKey(stakePdaData?.owner());
        console.log(x.toBase58());
        userData=svm.getAccount(userAcc.publicKey.toBytes());
        console.log('user lamports after delete : ',userData?.lamports());
    })
})





