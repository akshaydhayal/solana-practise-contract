use solana_program::{
    pubkey::Pubkey,
    account_info::{AccountInfo,next_account_info},
    program_error::ProgramError,
    entrypoint::ProgramResult,system_program,
    program::{invoke}
};
use spl_token::instruction::{freeze_account};

pub fn freeze_ata(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
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

    let freeze_ata_ix=freeze_account(token_prog.key,
        mint_ata.key, mint.key,
        user.key, &[user.key])?;
    invoke(&freeze_ata_ix,
        &[mint_ata.clone(),mint.clone(),user.clone(),token_prog.clone()])?;
    Ok(())
}