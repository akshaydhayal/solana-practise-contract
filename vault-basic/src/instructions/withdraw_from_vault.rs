use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::invoke_signed, program_error::ProgramError, pubkey::Pubkey, rent::Rent, system_instruction::transfer, sysvar::Sysvar
};

use borsh::{BorshSerialize,BorshDeserialize};
use crate::state::Vault;

pub fn withdraw_from_vault(program_id:&Pubkey,accounts:&[AccountInfo],amount:u32)->ProgramResult{
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
    if vaultPda.owner!=program_id{
        return Err(ProgramError::IncorrectAuthority);
    }
    
    let seeds=&[b"vault",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault",user.key.as_ref(),&[bump]];
    if expectedPda!=*vaultPda.key{
        return Err(ProgramError::InvalidSeeds);
    }

    // let ix=transfer(vaultPda.key,user.key,amount as u64);
    // invoke_signed(&ix,
    //     &[vaultPda.clone(),user.clone(),system_prog.clone()],
    //     &[seeds_with_bump]
    // )?;
    
    let vault_bal=**vaultPda.try_borrow_lamports()?;
    msg!("vault bal : {}",vault_bal);
    
    let rent=Rent::get()?;
    let vault_min_bal_for_rent_exemption=rent.minimum_balance(36 as usize);
    if vault_bal-(amount as u64) < vault_min_bal_for_rent_exemption{
        return Err(ProgramError::InsufficientFunds);
    }
    let vault_data_len=vaultPda.data_len();
    msg!("vault pda data len : {}",vault_data_len);
    
    **vaultPda.try_borrow_mut_lamports()?-=amount as u64;
    **user.try_borrow_mut_lamports()?+=amount as u64;

    let mut vault_pda_data=Vault::try_from_slice(&vaultPda.data.borrow())?;
    vault_pda_data.balance-=amount;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}