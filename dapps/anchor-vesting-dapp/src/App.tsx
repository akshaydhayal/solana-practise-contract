import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

// import {Buffer} from 'buffer'; 
// // @ts-ignore
// window.Buffer=Buffer;

import { ConnectionProvider, useAnchorWallet, useConnection, useWallet, WalletProvider, type AnchorWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js"
import "@solana/wallet-adapter-react-ui/styles.css";
import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import idl from "./idl/anchor_vesting.json";
import type {AnchorVesting} from "./idl/anchor_vesting";
import { useEffect, useState } from "react";
import * as borsh from "borsh";
// import * as spl from "@solana/spl-token";

let vestingSchema:borsh.Schema={
  struct:{
    discriminator:'u64',
    employer:{array:{type:'u8',len:32}},
    company_name:'string',
    mint:{array:{type:'u8',len:32}},
    vestingVault:{array:{type:'u8',len:32}},
    vaultTokensUsed:'u64',
    bump:'u8',
}};

let employeeSchema:borsh.Schema={
  struct:{
    discriminator:'u64',
    employee:{array:{type:'u8',len:32}},
    employer:{array:{type:'u8',len:32}},
    employeeName:'string',
    employeeTotalVestedTokens:'u64',
    employeeCliffTime:'u64',
    employeeTokenIntervalTime:'u64',
    employeeTokenIntervalAmount:'u64',
    employeeClaimedIntervalsCount:'u64',
    bump:'u8',
  }
}
function Home(){
  
  const [company,setCompany]=useState('');
  const [totalVestingtokens,setTotalVestingTokens]=useState(0);
  const [vestingAcc,setVestigAcc]=useState([]);
  const [employeeAcc,setEmployeeAcc]=useState([]);

  const [employeeName,setEmployeeName]=useState('');
  const [employeeTotalVestedTokens,setEmployeeTotalVestedTokens]=useState(0);
  const [cliffTime,setCliffTime]=useState(0);
  const [tokenIntervalTime,setTokenIntervalTime]=useState(0);
  const [tokenIntervalAmount,setTokenIntervalAmount]=useState(0);

  let {connection}=useConnection();
  let {publicKey, wallet}=useWallet();
  let anchorWallt=useAnchorWallet();
  let employeeKeypair=Keypair.fromSecretKey(Uint8Array.from([40, 244, 122, 188, 32, 28, 248, 227, 229, 167, 140, 230, 166, 238, 37, 82, 215, 62, 67, 218, 135, 136, 61, 194, 131, 186, 22, 252, 247, 90, 240, 81, 177, 217, 180, 117, 171, 249, 246, 73, 134, 12, 159, 7, 206, 93, 22, 219, 117, 115, 5, 208, 7, 205, 120, 117, 219, 211, 110, 236, 84, 253, 64, 172]));
  console.log('employee public key : ',employeeKeypair.publicKey.toBase58());
    

  let PROGRAM_ID=new PublicKey("4iC229Bhe8AH7KYQqQTyiZX7fhY3buzX6upoS8Rfyk96");
  let mint=new PublicKey("2WtQVQ7T29Hjeq9aAHwAedmmv4tS6rYb2yCXvnoZ1ZQe");
  const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

  // let provider=new anchor.AnchorProvider(connection, wallet as AnchorWallet,{});
  let provider=new anchor.AnchorProvider(connection, anchorWallt,{});
  anchor.setProvider(provider);
  let user=provider.wallet as AnchorWallet;
  let program=new Program<AnchorVesting>(idl, provider);

  async function createVesting(){
    // e.preventDefault();
    try{
      let sig=await program.methods.initializeVesting(company,new anchor.BN(totalVestingtokens))
      .accounts({
        user:user.publicKey,
        mint:mint,
        tokenProgram:TOKEN_PROGRAM_ID
      }).signers([])
      .rpc();
      console.log(sig);
    }catch(err){
      console.log("tx error : ",err);
    }
  }
  
  async function addEmployee(companyName:string ,employer:number[], employeeName:string, totalVestTokens:number,
      cliffTime:number, tokenIntervalAmount:number, tokenIntervalTime:number){
    let employer_key=new PublicKey(employer);
    let employeeAddSig=await program.methods.addEmployee(companyName, employeeName,new anchor.BN(totalVestTokens), 
      new anchor.BN(cliffTime), new anchor.BN(tokenIntervalTime), new anchor.BN(tokenIntervalAmount))
    .accounts({
      user:publicKey,
      employer:employer_key.toBase58(),
      mint:mint,
      tokenProgram:TOKEN_PROGRAM_ID,
    })
    .signers([])
    .rpc();
    console.log("employeeAddSig : ",employeeAddSig);
  }

  useEffect(()=>{
    async function getAllVestingAcc(){
      let vestingAccounts=await connection.getParsedProgramAccounts(PROGRAM_ID,{
        filters:[
          {dataSize:167},
          {memcmp:{
            offset:8,
            bytes:user.publicKey.toBase58()
          }},
        ]
      });
      console.log("prog accounts : ",vestingAccounts[0].account);
      let deserialisedVesting=[];
      for(let i=0; i<vestingAccounts.length; i++){
        let deser=borsh.deserialize(vestingSchema,vestingAccounts[i].account.data);
        console.log(deser);
        deserialisedVesting.push(deser);
      }
      setVestigAcc(deserialisedVesting);
    }
    
    async function getAllEmployeeAcc(){
      let employees=await connection.getParsedProgramAccounts(PROGRAM_ID,{
        filters:[
          {dataSize:157},
          {memcmp:{
            offset:40,
            bytes:user.publicKey
          }}
        ]
      })
      let deserialisedEmployees=[];
      for(let i=0; i<employees.length; i++){
        let e=borsh.deserialize(employeeSchema,employees[i].account.data);
        deserialisedEmployees.push(e);
      }
      setEmployeeAcc(deserialisedEmployees);
    }

    getAllVestingAcc();
    getAllEmployeeAcc();
  },[connection,publicKey])

  return (
    <div>
      <p>Token Vesting</p>
      <div>
      {/* <form onSubmit={e=>createVesting(e)}> */}
        <input type="text" placeholder="enter company name" onChange={e=>setCompany(e.target.value)}/>
        <input type="number" placeholder="enter total vesting tokens" onChange={e=>setTotalVestingTokens(Number(e.target.value))}/>
        <button type="submit" onClick={createVesting}>Create Vesting</button>
      {/* </form> */}
      </div>

      <p>All Vesting schedules</p>
      {
        vestingAcc.map((v)=>{
          return (
            <div>
              <p>Company : {v.company_name}</p>
              <p>Employer : {new PublicKey(v.employer).toBase58()}</p>
              <p>Mint : {new PublicKey(v.mint).toBase58()}</p>
              <p>Mint : {v.mint}</p>
              <p>Vesting Vault : {new PublicKey(v.vestingVault).toBase58()}</p>
              <div>
                <p>Add Employee</p>
                <input type="text" placeholder="enter employee name" onChange={e=>setEmployeeName(e.target.value)}/>
                <input type="number" placeholder="enter total employee vested tokens" onChange={e=>setEmployeeTotalVestedTokens(Number(e.target.value))}/>
                <input type="number" placeholder="enter employee cliff time" onChange={e=>setCliffTime(Number(e.target.value))}/>
                <input type="number" placeholder="enter employee token interval amount" onChange={e=>setTokenIntervalAmount(Number(e.target.value))}/>
                <input type="number" placeholder="enter employee token interval time" onChange={e=>setTokenIntervalTime(Number(e.target.value))}/>
                <button className="" onClick={()=>addEmployee(v.company_name,v.employer, employeeName, employeeTotalVestedTokens,cliffTime,tokenIntervalAmount,tokenIntervalTime)}>Add Employee</button>
              </div>
            </div>
          )
        })
      }
      <p>All Employees</p>
      {
        employeeAcc.map((e)=>{
          return(
            <div>
              <p>Name : {e.employeeName}</p>
              <p>Employee Pubkey : {new PublicKey(e.employee).toBase58()}</p>
              <p>Employee total vested tokens : {e.employeeTotalVestedTokens}</p>
              <p>Employee Cliff time : {e.employeeCliffTime}</p>
              <p>Employee token interval time : {e.employeeTokenIntervalTime}</p>
              <p>Employee token interval amount : {e.employeeTokenIntervalAmount}</p>
              <p>Employee token claimed intervals : {e.employeeClaimedIntervalsCount}</p>
            </div>
          )
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
          <Home/>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
