use solana_program::{
    account_info::{AccountInfo,next_account_info},
    pubkey::Pubkey, entrypoint::ProgramResult, entrypoint,
    program_error::ProgramError,msg
};
use borsh::{BorshSerialize,BorshDeserialize};
use crate::{instruction::InstructionType, state::Vault};
use crate::instructions::{
    init_vault::init_vault,
    deposit_to_vault::deposit_to_vault,
    withdraw_from_vault::withdraw_from_vault
};
use crate::error::VaultError;
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{

    let e1=VaultError::InvalidInstructionData;
    let e2:ProgramError=VaultError::InvalidInstructionData.into();
    // msg!("error1 : {}",e1);
    // msg!("error2 : {}",e2);
    let instruction=InstructionType::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;
    // .map_err(|_| VaultError::InvalidInstructionData)?;

    match instruction {
        InstructionType::VaultInit=>{
            msg!("vault init ix called");
            init_vault(program_id, accounts)?;
        },
        InstructionType::DepositToVault { amount }=>{
            msg!("deposit to vault ix called!!");
            deposit_to_vault(program_id, accounts, amount)?;
        },
        InstructionType::WithdrawFromVault { amount }=>{
            msg!("withdraw from vault ix called!");
            withdraw_from_vault(program_id, accounts, amount)?;
        }
    }
    Ok(())
}