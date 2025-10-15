import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const Home = () => {
  let connection=useConnection();
  let {publicKey}=useWallet();
  return (
    <div>Home</div>
  )
}

export default Home