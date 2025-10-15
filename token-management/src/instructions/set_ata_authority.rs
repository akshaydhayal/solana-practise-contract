use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info,AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program::invoke, system_program
};
use spl_token::instruction::{set_authority,AuthorityType};

pub fn set_ata_authority(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let mint=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let mint_ata2=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=system_program::ID && *token_prog.key!=spl_token::ID && *ata_prog.key!=spl_associated_token_account::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    let set_authority_ix=set_authority(token_prog.key, 
        mint_ata.key, Some(token_prog.key), AuthorityType::AccountOwner,
        user.key, &[user.key])?;
    invoke(&set_authority_ix,
        &[mint_ata.clone(),user.clone(),user.clone(),token_prog.clone()])?;
    Ok(())
}