use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize,BorshSerialize,Debug)]
pub struct StakeAccount{
    pub staker:Pubkey,
    pub withdraw_authority:Pubkey,
    pub delegated_vote:Pubkey,
    pub points:i64,
    pub stakes:Vec<StakeEntry>,
    pub unstakes:Vec<UnstakeEntry>,
}

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct StakeEntry{
    pub stake_amount:u64,
    pub stake_time:i64,
}
#[derive(BorshSerialize,BorshDeserialize,Debug,Clone)]
pub struct UnstakeEntry{
    pub unstake_amount:u64,
    pub unstake_time:i64,
}