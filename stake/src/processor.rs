use solana_program::{
    pubkey::Pubkey, 
    account_info::{AccountInfo,next_account_info},
    entrypoint::ProgramResult,
    program_error::ProgramError, msg,
    compute_units::sol_remaining_compute_units
};
use borsh::{BorshSerialize,BorshDeserialize};

use crate::instruction::InstructionType;
use crate::instructions::{
    init_stake_ix::init_stake_ix,
    stake_ix::stake_ix,
    unstake_ix::unstake_ix,
    withdraw_ix::withdraw_ix,
    close_stake_account_ix::close_stake_account_ix
};

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8])->ProgramResult{

    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    match instruction{
        InstructionType::InitStake { bump }=>{
            msg!("init stake ix called!");
            init_stake_ix(program_id, accounts, bump)?;
        },
        InstructionType::Stake { amount }=>{
            msg!("stake ix called");
            stake_ix(program_id, accounts,amount)?;
        },
        InstructionType::Unstake {bump, amount }=>{
            msg!("Unstake ix called");
            unstake_ix(program_id, accounts,bump,amount)?;
        },
        InstructionType::WithdrawUnstaked{bump}=>{
            msg!("withdaw unstaked ix called");
            withdraw_ix(program_id, accounts, bump)?;
        },
        InstructionType::CloseStakeAccount { bump }=>{
            msg!("close stake account ix called");
            close_stake_account_ix(program_id, accounts, bump)?;
        }
    }
    Ok(())    
}