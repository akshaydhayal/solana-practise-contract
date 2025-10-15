import {createCreateInstruction,createUpdateInstruction} from "../sdk/src/generated/instructions";
import {PROGRAM_ID} from "../sdk"
import { describe } from "bun:test";
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

    let tx=new Transaction();
    let ix=createCreateInstruction(PROGRAM_ID);
    ix.keys=[{ 
        pubkey:user.publicKey, isSigner:true, isWritable:true
    }];
    console.log("ix : ",ix);
    tx.recentBlockhash=(await (connection.getLatestBlockhash())).blockhash;
    tx.add(ix);
    tx.sign(user);
    console.log("tx3 : ",tx.serialize());
    console.log("tx3 : ",Uint8Array.from(tx.serialize()));
    let txSig=await await sendAndConfirmRawTransaction(connection,tx.serialize());
    console.log("txsig : ",txSig);
})



// Uint8Array(171) 
// [ 1,
//   181, 218, 34, 218, 119, 174, 203, 248, 226, 42, 187, 89, 219, 169, 100, 2,
//   132, 137, 175, 254, 56, 249, 150, 161, 21, 245, 187, 83, 21, 82, 209, 5,
//   211, 190, 142, 170, 68, 225, 6, 145, 216, 1, 29, 95, 120, 75, 78, 1,
//   17, 159, 187, 191, 120, 16, 133, 102, 111, 145, 87, 36, 10, 188, 190, 13,
//   1, 0, 1,    //msg headers
//   2,          //compact accounts size u16
//   83, 166, 161, 103, 18, 234, 186, 48, 2, 56, 145, 153, 138, 187, 194, 46, 112, 148, 59, 204, 240, 153, 126, 89, 65, 53, 87, 43, 115, 10, 85, 217,
//   244, 118, 205, 24, 210, 176, 47, 162, 14, 183, 6, 26, 160, 80, 45, 160, 176, 6, 139, 0, 32, 176, 232, 235, 119, 237, 116, 228, 54, 149, 239, 72,
//   blockhash:
//   2, 55, 40, 21, 129, 70, 123, 201, 211, 39, 155, 175, 94, 28, 62, 235, 13, 127, 81, 191, 158, 118, 143, 22, 146, 249, 99, 18, 1, 139, 162, 127,
//   1,   no of ix
//   1,   program acount index
//   1,   no of accounts for ix
//   0,   account index
//   1,
//   0 ]




// const {createCreateInstruction,createUpdateInstruction} =require("../sdk/src/generated/instructions");
// const {PROGRAM_ID} =require("../sdk");
// const { describe } =require("node:test");
// const {Transaction, Connection,sendAndConfirmRawTransaction,Keypair, LAMPORTS_PER_SOL}=require("@solana/web3.js");