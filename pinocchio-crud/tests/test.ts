import {createCreateInstruction,createUpdateInstruction} from "../sdk/src/generated/instructions";
// import {PROGRAM_ID} from "../sdk";
import { describe } from "node:test";
import {Transaction, Connection,sendAndConfirmRawTransaction,Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";

describe("tests",async()=>{
    let connection=new Connection("http://localhost:8899","confirmed");
    let user=Keypair.fromSecretKey(Uint8Array.from([
        230, 116, 171, 66, 163, 137,  31, 236, 134, 165,  25,
        59, 196, 199, 71,  47,   9, 172, 169,  26, 171,  84,
        64,  73, 205,  6, 174, 179, 229, 231, 125, 215,  83,
        166, 161, 103, 18, 234, 186,  48,   2,  56, 145, 153,
        138, 187, 194, 46, 112, 148,  59, 204, 240, 153, 126,
        89,  65,  53, 87,  43, 115,  10,  85, 217
    ]));
    console.log("user balance : ",await connection.getBalance(user.publicKey));
    console.log("user secret key : ",user.publicKey.toBase58());
    // let airdropSig=await connection.requestAirdrop(user.publicKey,10*LAMPORTS_PER_SOL,);
    // console.log("airdrop sig",airdropSig);

    // let tx=new Transaction();
    // let ix=createCreateInstruction(PROGRAM_ID);
    // tx.recentBlockhash=(await (connection.getLatestBlockhash())).blockhash;
    // tx.add(ix);
    // tx.sign([user]);
    // let txSig=await await sendAndConfirmRawTransaction(connection,tx);
    // consoel.log("txsig : ",txSig);
})



// const {createCreateInstruction,createUpdateInstruction} =require("../sdk/src/generated/instructions");
// const {PROGRAM_ID} =require("../sdk");
// const { describe } =require("node:test");
// const {Transaction, Connection,sendAndConfirmRawTransaction,Keypair, LAMPORTS_PER_SOL}=require("@solana/web3.js");