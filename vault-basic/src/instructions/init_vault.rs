use solana_program::{
    pubkey::Pubkey,
    account_info::{AccountInfo,next_account_info},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    system_instruction::{create_account},
    program::{invoke_signed},
    rent::Rent,sysvar::Sysvar
};

use borsh::{BorshSerialize,BorshDeserialize};
use crate::constants::VAULT_SPACE;
use crate::state::Vault;

pub fn init_vault(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let vaultPda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if !vaultPda.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    let seeds=&[b"vault",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault",user.key.as_ref(),&[bump]];

    if *vaultPda.key!=expectedPda{
        return Err(ProgramError::InvalidSeeds);
    }

    // let vault_space:usize=32+4;
    let rent=Rent::get()?;
    let vault_min_balance=rent.minimum_balance(VAULT_SPACE);
    let ix=create_account(user.key, vaultPda.key, 
        vault_min_balance, VAULT_SPACE as u64, program_id);
    invoke_signed(&ix,
        &[user.clone(),vaultPda.clone(),system_prog.clone()],
    &[seeds_with_bump])?;
    
    let mut vault_pda_data=Vault::try_from_slice(&vaultPda.data.borrow())?;
    vault_pda_data.owner=*user.key;
    vault_pda_data.balance=0;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}