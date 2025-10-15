import { PublicKey } from '@solana/web3.js'
export * from './src/generated/instructions'
export * from './src/generated/types'

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ADDRESS = 'HTHYhmbNLvZmFJQD65icHSoSHr1rp3G7ejJQD7iYc6mM'

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
