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

pub fn init_mint(program_id:&Pubkey,accounts:&[AccountInfo],decimals:u8)->ProgramResult{
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
    if *system_prog.key!=system_program::ID{
        msg!("system program : {}  and {}",system_program::ID, system_prog.key);
        return Err(ProgramError::IncorrectProgramId);
    }
    if *token_prog.key!=spl_token::ID{
        return Err(ProgramError::IncorrectProgramId);
    }

    let mint_acc_size=spl_token::state::Mint::LEN;
    let rent=Rent::get()?;
    let mint_rent_exempt_bal=rent.minimum_balance(mint_acc_size);
    let create_mint_account_ix=create_account(user.key, mint.key,
        mint_rent_exempt_bal, mint_acc_size as u64, &spl_token::ID);
    invoke(&create_mint_account_ix,
        &[user.clone(),mint.clone(),system_prog.clone()])?;
    msg!("mint account created");
    
    let init_mint_ix=initialize_mint2(token_prog.key,
        mint.key, user.key,
        Some(user.key), decimals)?;
    invoke(&init_mint_ix, &[mint.clone(),token_prog.clone()])?;
    msg!("mint account initialised");
    Ok(())
}