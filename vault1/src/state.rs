use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize,BorshDeserialize)]
pub struct Vault{
    pub owner:Pubkey,
    pub token_account:Pubkey,
    pub is_locked:bool,
    pub unlock_timestamp:u64
}