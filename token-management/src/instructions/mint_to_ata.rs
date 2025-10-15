use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
     entrypoint, entrypoint::{ProgramResult}, 
     msg, program::{invoke,invoke_signed}, program_error::ProgramError, 
     program_pack::Pack, pubkey::Pubkey, rent::Rent, system_instruction::create_account,
      system_program, sysvar::Sysvar
};
use spl_token::{
    error::TokenError, instruction::{initialize_account3, initialize_mint2, initialize_multisig2, mint_to}, 
    state::{Account,AccountState,Mint}
};
use spl_associated_token_account::{
    instruction::{create_associated_token_account}
};

pub fn mint_to_ata(program_id:&Pubkey, accounts:&[AccountInfo],mint_amount:u64)->ProgramResult{
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
    let mint_ix=mint_to(token_prog.key, mint.key,
        mint_ata.key, user.key, &[user.key], mint_amount)?;
    invoke(&mint_ix,
        &[mint.clone(),mint_ata.clone(),user.clone(),token_prog.clone()])?;
    msg!("minted {} token to {}",mint.key,mint_ata.key);
    Ok(())
}