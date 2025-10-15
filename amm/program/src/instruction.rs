use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    pubkey::Pubkey
};

#[derive(BorshSerialize,BorshDeserialize)]
pub enum InstructionType{
    //here pool pda is created, 2 vault(for Token A and B) created, and LP token is also created
    CreatePool{fee_bps:u16,poolBump:u8},  
    AddLiquidity{depAmountA:u64, depAmountB:u64, poolBump:u8},
    RemoveLiquidity{lp_amount_burn:u64, poolBump:u8},
    // RemoveLiquity{poolId:u8}
}