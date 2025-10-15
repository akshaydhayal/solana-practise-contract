use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult,
     program::{invoke, invoke_signed}, program_error::ProgramError, program_pack::Pack, 
     pubkey::Pubkey, rent::Rent, system_instruction::create_account, sysvar::Sysvar,msg
};
// use crate::error::LPError;
use crate::state::LiquidityPool;
use borsh::{BorshSerialize,BorshDeserialize};
use spl_token::instruction::{
    initialize_mint2,
};
use spl_associated_token_account::{
    instruction::create_associated_token_account
};

pub fn create_pool(
    program_id:&Pubkey, accounts:&[AccountInfo], fee_bps:u16, poolbump:u8
)->ProgramResult{
    let mut accounts_iter=accounts.iter();
    msg!("len: {}",accounts.len());
    let user=next_account_info(&mut accounts_iter)?;
    let pool_pda=next_account_info(&mut accounts_iter)?;
    let pool_vault_a_ata=next_account_info(&mut accounts_iter)?;
    let pool_vault_b_ata=next_account_info(&mut accounts_iter)?;
    let mint_a=next_account_info(&mut accounts_iter)?;
    let mint_b=next_account_info(&mut accounts_iter)?;
    let lp_mint=next_account_info(&mut accounts_iter)?;
    let system_prog=next_account_info(&mut accounts_iter)?;
    let token_prog=next_account_info(&mut accounts_iter)?;
    let ata_prog=next_account_info(&mut accounts_iter)?;

    if !user.is_signer || !user.is_writable{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if !pool_pda.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    let pool_seeds=&[b"pool",mint_a.key.as_ref(),mint_b.key.as_ref(),user.key.as_ref(),&[poolbump]];
    let pool_derived_pda=Pubkey::create_program_address(pool_seeds, program_id)?;
    if *pool_pda.key!=pool_derived_pda{
        // return Err(LPError::PoolPdaMismatch.into());
        return Err(ProgramError::InvalidSeeds);
    }
    let mut liqPool=LiquidityPool{
        mintA:*mint_a.key,
        mintB:*mint_b.key,
        amountA:0,
        amountB:0,
        LPToken:Pubkey::default(),
        owner:*user.key,
        fee_bps:fee_bps
    };
    let pool_pda_size=borsh::to_vec(&liqPool)?.len();
    let rent=Rent::get()?;
    let pool_pda_min_bal=rent.minimum_balance(pool_pda_size);

    let create_pool_pda_ix=create_account(user.key,
        pool_pda.key, pool_pda_min_bal,
        pool_pda_size as u64, program_id);
    invoke_signed(&create_pool_pda_ix,
        &[user.clone(),pool_pda.clone(),system_prog.clone()],
        &[pool_seeds])?;
    msg!("pool pda created!!");
        
    // //creating 2 vaults ata accounts that are owned by token program and has pool pda authority
    let pool_vault_a_ata_create_ix=create_associated_token_account(user.key,
        pool_pda.key, mint_a.key, &spl_token::ID);
        // user.key, MintA, &spl_token::ID);
    invoke(&pool_vault_a_ata_create_ix, 
           &[user.clone(),pool_vault_a_ata.clone(),pool_pda.clone(),
           mint_a.clone(),system_prog.clone(),token_prog.clone(),ata_prog.clone()])?;
           
    let pool_vault_b_ata_create_ix=create_associated_token_account(user.key,
        pool_pda.key, mint_b.key, &spl_token::ID);
    invoke(&pool_vault_b_ata_create_ix,
        &[user.clone(), pool_vault_b_ata.clone(), pool_pda.clone(),
        mint_b.clone(), system_prog.clone(), token_prog.clone()])?;
    msg!("vault ata a and vault ata b created!");

    let mint_size=spl_token::state::Mint::LEN;
    let mint_min_bal=rent.minimum_balance(mint_size);
    let lp_mint_create_account_ix=create_account(user.key,
        lp_mint.key, mint_min_bal, mint_size as u64, &spl_token::ID);
    invoke(&lp_mint_create_account_ix,
        &[user.clone(),lp_mint.clone(),system_prog.clone()])?;
    msg!("lp mint account created!");
    
    let lp_mint_initialise_ix=initialize_mint2(&spl_token::ID,
        lp_mint.key, pool_pda.key, None, 5)?;
    invoke(&lp_mint_initialise_ix, &[lp_mint.clone()])?;
    msg!("lp mint account initialised!");

    //create a LP pda, create 2 token A and Token B vaults and create a lp mint account for pool
    liqPool.LPToken=*lp_mint.key; 
    liqPool.serialize(&mut *pool_pda.data.borrow_mut())?;
    msg!("pool pda serialized");
    Ok(())
}