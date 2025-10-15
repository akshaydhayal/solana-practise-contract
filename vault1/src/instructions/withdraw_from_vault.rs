use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult, msg, program::{invoke, invoke_signed},
    program_error::ProgramError, pubkey::Pubkey,
    sysvar::clock, sysvar::Sysvar
};
use spl_token::instruction::{
    transfer
};

pub fn withdraw_from_vault(program_id:&Pubkey, accounts:&[AccountInfo],amount:u64)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let mint=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let vault_mint_ata=next_account_info(&mut account_iter)?;
    let vault_pda=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;

    let c=clock::Clock::get()?;
    msg!("unix timestamp : {}",c.unix_timestamp);
    msg!("epoch : {}",c.epoch);
    msg!("slot : {}",c.slot);
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let vault_seeds=&[b"vault",user.key.as_ref(),mint.key.as_ref()];
    let (vault_derived_pda,bump)=Pubkey::find_program_address(vault_seeds,program_id);
    let vault_seeds_with_bump=&[b"vault", user.key.as_ref(), mint.key.as_ref(), &[bump]];
    if *vault_pda.key!=vault_derived_pda{
        return Err(ProgramError::InvalidSeeds);
    }

    let transfer_ix=transfer(&spl_token::ID, 
        vault_mint_ata.key, mint_ata.key,
        &vault_derived_pda, &[&vault_derived_pda], amount)?;
    invoke_signed(&transfer_ix,
        &[vault_mint_ata.clone(), mint_ata.clone(), vault_pda.clone(),
        vault_pda.clone(),token_prog.clone()],
        &[vault_seeds_with_bump])?;
    msg!("withdraw from vault mint to user mint success");
    Ok(())
}