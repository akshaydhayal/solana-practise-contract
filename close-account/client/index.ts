import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

// let programId=new PublicKey("EZBm3YqEhwuhf1zdBcGUs3AMpKVdrGLSRppmrLN5Rz74");
let programId=new PublicKey("EZBm3YqEhwuhf1zdBcGUs3AMpKVdrGLSRppmrLN5Rz74");
let connection=new Connection("https://api.devnet.solana.com","confirmed");
let secret =Uint8Array.from([
    48,182,182,234,169,224,236,113,52,199,47,66,39,2,163,52,183,44,45,27,127,
    49,133,151,64,70,248,16,46,218,234,198,42,180,5,68,243,235,189,56,197,37,
    17,85,205,189,100,191,64,74,171,3,37,193,199,195,213,54,156,198,228,15,248,188]);

let user=Keypair.fromSecretKey(secret);

async function getProgramDetails(program:PublicKey){
    let programDetails=await connection.getAccountInfo(program);
    console.log(programDetails);
}
async function getAccountDetails(user:PublicKey){
    let accountDetails=await connection.getAccountInfo(user);
    console.log(accountDetails);
    console.log("owner : ",accountDetails?.owner.toBase58());
    console.log(accountDetails?.data);
    console.log("bal : ",accountDetails?.lamports/LAMPORTS_PER_SOL);
}

let seeds=[Buffer.from("user"),
    user.publicKey.toBuffer()];
    let [pda,bump]=PublicKey.findProgramAddressSync(seeds,programId);
    
console.log("user : ",user.publicKey.toBase58());
console.log("pda : ",pda.toBase58());

async function createPdaAccount(){
    let ix=new TransactionInstruction({
        programId:programId,
        keys:[
            {pubkey:user.publicKey, isSigner:true, isWritable:true},
            {pubkey:pda, isSigner:false, isWritable:true},
            {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
        ],
        data:Buffer.from([0,5,0,0,0])
    });
    let tx=new Transaction().add(ix);
    let bh=(await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash=bh;
    tx.sign(user);
    
    let txStatus=await connection.sendRawTransaction(tx.serialize());
    console.log(txStatus);
}

async function closeAccount(){
    let ix=new TransactionInstruction({
        programId,
        keys:[
            {pubkey:user.publicKey, isSigner:true, isWritable:true},
            {pubkey:pda, isSigner:false, isWritable:true},
            {pubkey:SystemProgram.programId, isSigner:false, isWritable:false},
        ],
        data:Buffer.from([1])
    });
    let tx=new Transaction().add(ix);
    let bh=await (await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash=bh;
    tx.sign(user);
    
    let txStatus=await connection.sendRawTransaction(tx.serialize());
    console.log(txStatus);
}
// createPdaAccount();
// getAccountDetails(pda);
// getAccountDetails(user.publicKey);
// closeAccount();


let programId2=new PublicKey("rkUYTimqCuAfEndaHR5eaN6T48hyJA2XAqDpAuJRwqT");
getProgramDetails(programId2);


