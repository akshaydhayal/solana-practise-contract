use borsh::BorshSerialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey, rent::Rent, system_instruction::create_account, system_program, sysvar::Sysvar
};
use spl_associated_token_account::instruction::{
    create_associated_token_account
};
use crate::state::Vault;

pub fn init_vault(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let vault_pda=next_account_info(&mut account_iter)?;
    let mint=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let vault_mint_ata=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    let vault_seeds=&[b"vault", user.key.as_ref(),mint.key.as_ref()];
    let (vault_derived_pda,bump)=Pubkey::find_program_address(vault_seeds,program_id);
    let vault_seeds_with_bump=&[b"vault", user.key.as_ref(),mint.key.as_ref(), &[bump]];
    
    msg!("vault pda from client : {}",vault_pda.key);
    msg!("vault pda derived in contract : {}",vault_derived_pda);
    if *vault_pda.key!=vault_derived_pda{
        return Err(ProgramError::InvalidSeeds);
    }
    if !vault_pda.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    let vault_size:usize=32+32+1+8;
    let rent=Rent::get()?;
    let vault_ret_exempt_bal=rent.minimum_balance(vault_size);
    
    let vault_create_ix=create_account(user.key,
        vault_pda.key, vault_ret_exempt_bal,
        vault_size as u64, program_id);
    invoke_signed(&vault_create_ix,
        &[user.clone(),vault_pda.clone(),system_prog.clone()],
        &[vault_seeds_with_bump]);
    msg!("vault pda created!!");

    let create_vault_mint_ata_ix=create_associated_token_account(user.key,
        &vault_derived_pda, mint.key, &spl_token::ID);
    invoke(&create_vault_mint_ata_ix,
        &[user.clone(),vault_mint_ata.clone(),vault_pda.clone(),mint.clone(),
        system_prog.clone(),token_prog.clone(),ata_prog.clone()])?;
    msg!("vault mint ata account created");

    let vault_data=Vault{
        owner:*user.key,
        token_account:*mint_ata.key,
        is_locked:true,
        unlock_timestamp:3
    };
    vault_data.serialize(&mut *vault_pda.data.borrow_mut())?;
    Ok(())
}