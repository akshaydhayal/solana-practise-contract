// import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react'
// import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
// import { clusterApiUrl, Transaction } from '@solana/web3.js'
// import { useState } from 'react'
// import "@solana/wallet-adapter-react-ui/styles.css";
// import {PROGRAM_ID} from "../../sdk/index";

// function App() {
//   return (
//     <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
//       <WalletProvider wallets={[]}>
//         <WalletModalProvider>
//           <WalletMultiButton/>
//             <h1>Hello</h1>
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   )
// }

// export default App







import { ConnectionProvider, useAnchorWallet, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl, Transaction } from '@solana/web3.js'
import "@solana/wallet-adapter-react-ui/styles.css";
import {createCreateInstruction,createUpdateInstruction} from "../../sdk/src/generated/instructions"
import {PROGRAM_ID} from "../../sdk/index";
// import * as anchor from "@coral-xyz/anchor";

function Home(){
  let {connection}=useConnection();
  let {publicKey,sendTransaction,wallet,signTransaction}=useWallet();
  async function sendTx(){
    if(!publicKey){return;}
    // let user=wallet as anchor.Wallet;
    // let ix=createCreateInstruction(PROGRAM_ID);
    let ix=createUpdateInstruction(PROGRAM_ID);
    ix.keys=[
      {pubkey:publicKey, isSigner:true, isWritable:true}
    ];
    let tx=new Transaction().add(ix);
    tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
    tx.feePayer=publicKey;
    // tx.sign([user]);
    console.log("before signed tx : ",tx);
    let signedTx=await signTransaction(tx);
    console.log("signed tx : ",signedTx);
    try{
      // let txSig=await sendTransaction(tx,connection);
      // let txSig=await connection.sendRawTransaction(signedTx.serialize(),{skipPreflight:true});
      let txSig=await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txSig);
      console.log("txSig  : ",txSig);
    }catch(err){
      console.log("tx failed",err);
    }
  }
  return(
    <div>
      <p>Home</p>
      <button onClick={sendTx}>Send Transaction</button>
    </div>
  )
}

function App() {
  return (
    <ConnectionProvider endpoint='http://localhost:8899'>
      <WalletProvider wallets={[]}>
        <WalletModalProvider>
          <WalletMultiButton/>
            <h1>Hello</h1>
            <Home/>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
