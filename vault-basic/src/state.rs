use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize,BorshSerialize)]
pub struct Vault{
    pub owner:Pubkey,
    pub balance:u32
}