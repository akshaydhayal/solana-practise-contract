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

pub fn create_mint_ata(program_id:&Pubkey,accounts:&[AccountInfo])->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let mint=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let mint_ata2=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;
    
    // if !user.is_signer && !mint_ata.is_signer{
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if *token_prog.key!=spl_token::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if !mint_ata.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    if *ata_prog.key!=spl_associated_token_account::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    let mint_ata_size=spl_token::state::Account::LEN;
    let rent=Rent::get()?;
    let mint_ata_rent_exempt_bal=rent.minimum_balance(mint_ata_size);
    // let create_mint_ata_ix=create_account(user.key,
    //     mint_ata.key, mint_ata_rent_exempt_bal,
    //     mint_ata_size as u64, owner);

    let create_mint_ata_ix=create_associated_token_account(user.key,
        user.key, mint.key, token_prog.key);
    invoke(&create_mint_ata_ix,
        &[user.clone(),mint_ata.clone(),user.clone(),
        mint.clone(),system_prog.clone(),token_prog.clone(),ata_prog.clone()])?;
    msg!("ata account created");
    Ok(())
}