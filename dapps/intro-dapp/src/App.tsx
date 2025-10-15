import { ConnectionProvider, useAnchorWallet, useConnection, useWallet, WalletProvider, type AnchorWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import * as borsh from "borsh";
import "@solana/wallet-adapter-react-ui/styles.css";
import * as anchor from "@coral-xyz/anchor";
import type {AnchorIntro} from "./idl/anchor_intro";
import idl from "./idl/anchor_intro.json";
import { Program } from '@coral-xyz/anchor';

import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;

let introPdaSchema:borsh.Schema={
  struct:{
    discriminator:'u64',
    name:'string',
    bio:'string',
  }
}

function IntroDapp(){
  let {connection}=useConnection();
  let {publicKey, sendTransaction,wallet}=useWallet();
  let anchorWallet=useAnchorWallet();
  let PROGRAM_ID=new PublicKey("CUkzBSEdfAxfCLH1kAXLdjWhtcWRyf89ExsukP3VSgCZ");
  
  let [name,setName]=useState<String>('');
  let [bio,setBio]=useState<String>('');
  let [newBio,setNewBio]=useState('');
  let [sig,setSig]=useState<null|String>(null);

  const [allIntro,SetAllIntro]=useState<anchor.DecodeType<typeof idl,AnchorIntro>[]>([]);
  
  if(!anchorWallet || ! wallet){
    return<p>Connect Wallet First</p>
  }
  //beow both are same
  // let provider=new anchor.AnchorProvider(connection,anchorWallet,{});
  let provider=new anchor.AnchorProvider(connection, wallet as AnchorWallet,{});
  anchor.setProvider(provider);  
  let program=new anchor.Program<AnchorIntro>(idl,provider);

  async function addIntro(){
    if(!connection || !publicKey){return;}
    // let [introPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("intro"),publicKey?.toBuffer()],PROGRAM_ID);
    let [introPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("intro"),publicKey?.toBuffer()],PROGRAM_ID);
    
    try{
      let txStatus=await program.methods.initIntro("Akshay","I am an enginner")
      .accounts({
        user:provider.publicKey,
      })
      .signers([])
      .rpc();
      console.log("tx sig : ",txStatus);
      setSig(txStatus);
      
    }catch(err){
      console.error("tx failed : ",err);
    }
  }
  async function updateIntro(){
    try{
      let txSig=await program.methods.updateIntro(newBio)
      .accounts({
        user:publicKey,
      })
      .rpc();
      console.log("update intro tx sig : ",txSig);
    }catch(err){
      console.log("update tx error : ",err);
    }
  }
  useEffect(()=>{
    async function getAllIntros(){
      let acc=await connection.getProgramAccounts(PROGRAM_ID);
      // let deserialisedIntros:({discriminator:number,name:String,bio:String}[] | null)=acc.map(i=>{
      let deserialisedIntros=acc.map(i=>{
        return borsh.deserialize(introPdaSchema, i.account.data);
      })
      console.log("deserialised all intors",deserialisedIntros);
      SetAllIntro(deserialisedIntros);
  
      let deserialisedData=borsh.deserialize(introPdaSchema,acc[0].account.data)
      console.log(deserialisedData);
  
      let acc2=await connection.getParsedProgramAccounts(PROGRAM_ID);
      console.log(acc2[0].account);
    }
    getAllIntros();
  },[]);

  return(
    <div>
      <p className='text-2xl font-semibold'>Add Intro</p>
      <p>Name</p>
      <input type='text' placeholder='enter name' onChange={(e)=>setName(e.target.value)}/>
      <p>Bio</p>
      <input type='text' placeholder='enter bio' onChange={(e)=>setBio(e.target.value)}/>
      <button onClick={addIntro}>Add Name to blockchain</button>

      <p className='text-2xl font-semibold'>Update Intro</p>
      <p>enter New bio</p>
      <input type='text' placeholder='enter new bio' onChange={e=>setNewBio(e.target.value)}/>
      <button onClick={updateIntro}>Update Intro</button>
      
      <p className='text-2xl font-semibold'>All Intros</p>
      {
        allIntro.map((i)=>{
          return <div>
            <p>{i.name}</p>
            <p>{i.bio}</p>
          </div>
        })
      }
    </div>
  )
}


function App() {
  let endpoint=clusterApiUrl("devnet");
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]}>
        <WalletModalProvider>
          <WalletMultiButton/>
          <IntroDapp/>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App























// import { Buffer } from 'buffer';
// // @ts-ignore
// window.Buffer = Buffer;


// class Intro{
//   name:String;
//   bio:String;

//   constructor(name:String, bio:String){
//     this.name=name;
//     this.bio=bio;
//   }
// }


// async function addName(){
//   if(!connection || !publicKey){return;}
//   let [introPda,bump]=PublicKey.findProgramAddressSync([Buffer.from("intro"),publicKey?.toBuffer()],PROGRAM_ID);
//   let serialisedIntroData=borsh.serialize(introPdaSchema, new Intro(name,bio));
//   console.log("serialised data : ",serialisedIntroData);
//   console.log("serialised data : ",serialisedIntroData[0]);
//   console.log("serialised data : ",serialisedIntroData[4]);
//   console.log("serialised data : ",serialisedIntroData[5]);

//   let ix=new TransactionInstruction({
//     programId:PROGRAM_ID,
//     keys:[
//       {pubkey:publicKey,isSigner:true, isWritable:false},
//       {pubkey:introPda,isSigner:false, isWritable:true},
//       {pubkey:SystemProgram.programId,isSigner:false, isWritable:false},
//     ],
//     // Uint8Array(10) [1, 0, 0, 0, 97, 1, 0, 0, 0, 98, buffer: ArrayBuffer(10), byteLength: 10, byteOffset: 0, length: 10, Symbol(Symbol.toStringTag): 'Uint8Array']
//     // data:Buffer.concat([Buffer.from([0]), serialisedIntroData])
//     data:Buffer.from(serialisedIntroData)
//   });
//   let tx=new Transaction().add(ix);
//   try{
//     let txSig=await sendTransaction(tx,connection);
//     console.log("tx sig :",txSig);
//     setSig(txSig);
//   }catch(err){
//     console.error("tx failed : ",err);
//     if(err.logs){
//       console.error("Program logs:", err.logs);
//     }
//   }
// }