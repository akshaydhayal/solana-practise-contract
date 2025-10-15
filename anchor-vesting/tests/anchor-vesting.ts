import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {AnchorVesting} from "../target/types/anchor_vesting";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as spl from "@solana/spl-token";

describe("anchor vestin tests",()=>{
  let provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let program=anchor.workspace.AnchorVesting as Program<AnchorVesting>;
  let connection=provider.connection;
  let user=provider.wallet as anchor.Wallet;

  let mint=anchor.web3.Keypair.generate();
  let employee=anchor.web3.Keypair.generate();

  before(async()=>{
    let createMintIx=SystemProgram.createAccount({
      fromPubkey:user.publicKey,newAccountPubkey:mint.publicKey,lamports:await connection.getMinimumBalanceForRentExemption(spl.MINT_SIZE), space:spl.MINT_SIZE, programId:spl.TOKEN_PROGRAM_ID
    })
    let initializeMintIx=spl.createInitializeMint2Instruction(mint.publicKey,5,user.publicKey,user.publicKey);

    let employeeCreateIx=SystemProgram.createAccount({
      fromPubkey:user.publicKey,newAccountPubkey:employee.publicKey,lamports:1000000000,space:0, programId:SystemProgram.programId
    });

    let tx=new Transaction().add(createMintIx,initializeMintIx,employeeCreateIx);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.sign(user.payer,mint,employee);
    let txStatus=await connection.sendRawTransaction(tx.serialize());
    console.log("mint create and init sig : ",txStatus);
    await connection.confirmTransaction(txStatus);

    let userMintTreasuryAta=await spl.getOrCreateAssociatedTokenAccount(connection,user.payer,mint.publicKey,user.publicKey);
    let mintSig=await spl.mintTo(connection,user.payer,mint.publicKey,userMintTreasuryAta.address,user.payer,800000);
    await connection.confirmTransaction(mintSig);

    let userTreasuryAtaBal=await connection.getTokenAccountBalance(userMintTreasuryAta.address);
    console.log("user treasurey ata bal : ",userTreasuryAtaBal);

  }),

  it("initialize vesting",async()=>{
    await program.methods.initializeVesting("Google",new anchor.BN(800))
    .accounts({
      mint:mint.publicKey,
      user:user.publicKey,
      tokenProgram:spl.TOKEN_PROGRAM_ID

    })
    .signers([])
    .rpc();

    // let [vestingPda,_]=PublicKey.findProgramAddressSync([Buffer.from("vesting"),Buffer.from("Google")],program.programId);
    let [vestingPda,_]=PublicKey.findProgramAddressSync([Buffer.from("vesting"),user.publicKey.toBuffer()],program.programId);
    let vestingPdaData=await program.account.vestingAccount.fetch(vestingPda);
    console.log(vestingPdaData);
    
    let vestingVaultAta=spl.getAssociatedTokenAddressSync(mint.publicKey,vestingPda,true);
    console.log("vesting vault ata balance : ",await connection.getTokenAccountBalance(vestingVaultAta));

  });

  it("add employee to vesting",async()=>{
    console.log("employee.publicKey : ", employee.publicKey);
    await program.methods.addEmployee("Google", "Raj",new anchor.BN(200),new anchor.BN(1757974500),new anchor.BN(40),new anchor.BN(50))
    .accounts({
      mint:mint.publicKey,
      tokenProgram:spl.TOKEN_PROGRAM_ID,
      user:employee.publicKey,
      employer:user.publicKey
    })
    .signers([employee])
    .rpc();
    
    // let [employeePda,_]=PublicKey.findProgramAddressSync([Buffer.from("employee"),Buffer.from("Raj")],program.programId);
    let [employeePda,_]=PublicKey.findProgramAddressSync([Buffer.from("employee"),employee.publicKey.toBuffer()],program.programId);
    let emplyeePdaData=await program.account.employee.fetch(employeePda);
    console.log("employee pda data : ",emplyeePdaData);

    let [vestingPda,x]=PublicKey.findProgramAddressSync([Buffer.from("vesting"),user.publicKey.toBuffer()],program.programId);
    let vestingPdaData=await program.account.vestingAccount.fetch(vestingPda);
    console.log("vesting pda data : ",vestingPdaData);
  }),

  it("claim vestedd tokens",async()=>{
    await program.methods.claimTokens("Google","Raj")
    .accounts({
      mint:mint.publicKey,
      tokenProgram:spl.TOKEN_PROGRAM_ID,
      user:employee.publicKey
    })
    .signers([employee])
    .rpc();

    // let [employeePda,_]=PublicKey.findProgramAddressSync([Buffer.from("employee"),Buffer.from("Raj")],program.programId);
    let [employeePda,_]=PublicKey.findProgramAddressSync([Buffer.from("employee"),employee.publicKey.toBuffer()],program.programId);
    let emplyeePdaData=await program.account.employee.fetch(employeePda);
    console.log("employee pda data : ",emplyeePdaData);

    let [vestingPda,x]=PublicKey.findProgramAddressSync([Buffer.from("vesting"),user.publicKey.toBuffer()],program.programId);
    let vestingPdaData=await program.account.vestingAccount.fetch(vestingPda);
    console.log("vesting pda data : ",vestingPdaData);

    let employeeClaimAta=spl.getAssociatedTokenAddressSync(mint.publicKey,employee.publicKey);
    console.log("employee claim ata balance : ",await connection.getTokenAccountBalance(employeeClaimAta));
    let vestingVaultAta=spl.getAssociatedTokenAddressSync(mint.publicKey,vestingPda,true);
    console.log("vesting vault ata balance : ",await connection.getTokenAccountBalance(vestingVaultAta));

  })
  
})










// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { AnchorVesting } from "../target/types/anchor_vesting";

// describe("anchor-vesting", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.AnchorVesting as Program<AnchorVesting>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });
