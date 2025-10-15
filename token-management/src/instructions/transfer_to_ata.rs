use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::invoke, program_error::ProgramError, pubkey::Pubkey, system_program
};
use spl_token::instruction::transfer;

pub fn transfer_to_ata(program_id:&Pubkey, accounts:&[AccountInfo],amount:u64)->ProgramResult{
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

    let transfer_ix=transfer(token_prog.key,
        mint_ata.key, mint_ata2.key, user.key,
        &[user.key], amount)?;
    invoke(&transfer_ix,
        &[mint_ata.clone(),mint_ata2.clone(),user.clone(),token_prog.clone()])?;
    Ok(())
}