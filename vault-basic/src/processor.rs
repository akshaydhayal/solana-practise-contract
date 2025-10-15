// pub mod ins

use solana_program::{
    pubkey::Pubkey,
    account_info::{AccountInfo,next_account_info},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    system_instruction::{create_account, transfer},
    program::{invoke_signed,invoke},
    rent::Rent,sysvar::Sysvar,msg
};

use borsh::{BorshSerialize,BorshDeserialize};

use crate::constants::VAULT_SPACE;
use crate::state::Vault;
use crate::instruction::InstructionType;
use crate::instructions::init_vault::init_vault;
use crate::instructions::deposit_to_vault::deposit_to_vault;
use crate::instructions::withdraw_from_vault::withdraw_from_vault;

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    
    let instruction=InstructionType::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction{
        InstructionType::Init=>{
            init_vault(program_id,accounts)?;
        },
        InstructionType::Deposit(amount)=>{
            deposit_to_vault(program_id, accounts, amount)?;
        },
        InstructionType::Withdraw(amount)=>{
            withdraw_from_vault(program_id,accounts,amount)?;
        }
    }
    Ok(())
}





