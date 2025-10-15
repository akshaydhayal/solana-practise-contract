import { amountToUiAmount, createInitializeInterestBearingMintInstruction, createInitializeMint2Instruction, createInterestBearingMint, ExtensionType, getMintLen, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction, SendTransactionError } from "@solana/web3.js";

let connection =new Connection(clusterApiUrl("devnet"),"confirmed");

let x=[
    48,182,182,234,169,224,236,113,52,199,47,66,39,2,163,52,183,44,45,27,127,49,133,151,64,70,248,16,46,218,234,198,42,180,5,68,243,235,189,56,197,37,17,85,205,189,100,191,64,74,171,3,37,193,199,195,213,54,156,198,228,15,248,188];

let userAcc=Keypair.fromSecretKey(Uint8Array.from(x));
let mintAcc=Keypair.generate();
let mintAuth=Keypair.generate();
let rateAuth=Keypair.generate();
console.log(userAcc.publicKey.toBase58());
console.log(TOKEN_2022_PROGRAM_ID.toBase58());


async function createInterestTokenManual(){
    let mintLen=getMintLen([ExtensionType.InterestBearingConfig]);
    let lamportsReq=await connection.getMinimumBalanceForRentExemption(mintLen);
    console.log(mintLen);
    console.log(lamportsReq);
    let mintCreateIx=SystemProgram.createAccount({
        fromPubkey:userAcc.publicKey,
        newAccountPubkey:mintAcc.publicKey,
        space:mintLen,
        lamports:lamportsReq,
        programId:TOKEN_2022_PROGRAM_ID
    });
    let mintInitialiseIx=createInitializeMint2Instruction(mintAcc.publicKey,5,mintAuth.publicKey,
        mintAuth.publicKey,TOKEN_2022_PROGRAM_ID);
    let interestTokenIx=createInitializeInterestBearingMintInstruction(mintAcc.publicKey,rateAuth.publicKey,77,TOKEN_2022_PROGRAM_ID);
    
    let tx=new Transaction().add(mintCreateIx,interestTokenIx,mintInitialiseIx); 
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.sign(userAcc,mintAcc);
    let txStatus=await connection.sendRawTransaction(tx.serialize());

    console.log(mintAcc.publicKey.toBase58());
    console.log(txStatus)
}
// createInterestTokenManual();






async function createInterestToken(){
    await createInterestBearingMint(connection,userAcc,mintAuth.publicKey,mintAuth.publicKey,
        rateAuth.publicKey, 30000, 5,mintAcc,null,TOKEN_2022_PROGRAM_ID);
        console.log(mintAcc.publicKey.toBase58());
    let idx=1;
    setInterval(async()=>{
        let amount=await amountToUiAmount(connection,userAcc,mintAcc.publicKey,100000*100000,TOKEN_2022_PROGRAM_ID)
        console.log("time : ",idx," amount : ",amount);
        idx=idx+1;
    },1000);
}
createInterestToken();