use solana_program::{
    pubkey::Pubkey, entrypoint::ProgramResult,msg,
    account_info::{AccountInfo,next_account_info},
    // system_instruction::{transfer},
    program::{invoke}
};
use spl_token::instruction::{
    transfer
};

pub fn deposit_to_vault(program_id:&Pubkey, accounts:&[AccountInfo],amount:u64)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let vault_mint_ata=next_account_info(&mut account_iter)?;
    //try removing this
    let token_prog=next_account_info(&mut account_iter)?;

    // let transfer_ix=transfer(mint_ata.key,
    //     vault_mint_ata.key, amount);
    //most probably this will fail as needs the mint ata seeds to sign for transfer
    // invoke(&transfer_ix, 
    //     &[mint_ata.clone(),vault_mint_ata.clone(),system_prog.clone()])?;

    let transfer_ix=spl_token::instruction::transfer(&spl_token::ID,
        mint_ata.key, vault_mint_ata.key,
        user.key, &[user.key], amount)?;
    msg!("a");
    
    invoke(&transfer_ix, 
        &[mint_ata.clone(),vault_mint_ata.clone(),
        user.clone(),user.clone(),token_prog.clone()])?;
    msg!("deposit to vault success");
    Ok(())
}