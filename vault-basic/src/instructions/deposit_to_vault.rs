use solana_program::{
    pubkey::Pubkey,
    account_info::{AccountInfo,next_account_info},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    system_instruction::{transfer},
    program::{invoke}
};

use borsh::{BorshSerialize,BorshDeserialize};
use crate::state::Vault;

pub fn deposit_to_vault(program_id:&Pubkey, accounts:&[AccountInfo],amount:u32)->ProgramResult{
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
    let ix=transfer(user.key, vaultPda.key, amount as u64);
    invoke(&ix, &[user.clone(),vaultPda.clone(),system_prog.clone()])?;

    let mut vault_pda_data=Vault::try_from_slice(& vaultPda.data.borrow())?;
    vault_pda_data.balance+=amount;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}