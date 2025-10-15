import * as anchor from"@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {AnchorIntro} from "../target/types/anchor_intro";

describe("anchor intro tests",()=>{
  let program=anchor.workspace.AnchorIntro as Program<AnchorIntro>;
  let provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let connection=provider.connection;
  let user=provider.wallet as anchor.Wallet;
  let [introPda,bump]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("intro"),user.publicKey.toBuffer()],program.programId)
  
  it("init intro ccount",async()=>{
    await program.methods.initIntro("Akshay","I am an enginner")
    .accounts({user:user.publicKey})
    .signers([])
    .rpc();

    let introPdaData=await program.account.intro.fetch(introPda);
    console.log(introPdaData);

    let userInfo=await connection.getAccountInfo(user.publicKey);
    console.log("user lamports : ",userInfo.lamports);
  }),

  it("update intro account's bio",async()=>{
    await program.methods.updateIntro("I am a Software enginner")
    .accounts({user:user.payer.publicKey})
    .rpc();

    let introPdaData=await program.account.intro.fetch(introPda);
    console.log(introPdaData);

    let userInfo=await connection.getAccountInfo(user.publicKey);
    console.log("user lamports : ",userInfo.lamports);

    let pdaInfo=await connection.getAccountInfo(introPda);
    console.log("intro pdaInfo : ",pdaInfo);
  }),
  
  it("delete intro account",async()=>{
    await program.methods.deleteBio()
    .accounts({
      user:user.publicKey,
      introAcc:introPda
    })
    .rpc();
    let introData=await program.account.intro.fetchNullable(introPda);
    console.log(introData);

    let userInfo=await connection.getAccountInfo(user.publicKey);
    console.log("user lamports : ",userInfo.lamports);
  })

})