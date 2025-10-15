use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::{invoke, invoke_signed}, program_error::ProgramError, program_pack::Pack, pubkey::Pubkey, rent::Rent, system_instruction::create_account, sysvar::Sysvar
};

use spl_token::instruction::{
    mint_to,transfer
};
use spl_token::state::Mint;

use spl_associated_token_account::instruction::create_associated_token_account;
use crate::{error::AmmError, state::LiquidityPool};

pub fn add_liquidity(program_id:&Pubkey,accounts:&[AccountInfo],depAmountA:u64,depAmountB:u64, poolBump:u8)->ProgramResult{
    let mut accounts_iter=accounts.iter();
    let user=next_account_info(&mut accounts_iter)?;
    let pool_pda=next_account_info(&mut accounts_iter)?;
    let pool_vault_ata_a=next_account_info(&mut accounts_iter)?;
    let pool_vault_ata_b=next_account_info(&mut accounts_iter)?;
    let mint_a=next_account_info(&mut accounts_iter)?;
    let mint_b=next_account_info(&mut accounts_iter)?;
    let user_ata_a=next_account_info(&mut accounts_iter)?;
    let user_ata_b=next_account_info(&mut accounts_iter)?;
    let lp_mint=next_account_info(&mut accounts_iter)?;
    let user_ata_lp_mint=next_account_info(&mut accounts_iter)?;
    let system_prog=next_account_info(&mut accounts_iter)?;
    let token_prog=next_account_info(&mut accounts_iter)?;
    let ata_prog=next_account_info(&mut accounts_iter)?;
    
    //A/B=800/1200, A/B=2/3
    //a=100,b=200
    // for 100a, need b=3/2*a=150
    // for 200b, need 133.3a
    // for a, calculate b needed
    // if needed b < amunt b then (a, b needed) is put in pool
    // if needed b > amount b, then calculate a needed for amount b , and put (needed a,b) in pool 

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let pool_seeds=&[b"pool",mint_a.key.as_ref(),mint_b.key.as_ref(),user.key.as_ref(),&[poolBump]];
    let pool_derived_pda=Pubkey::create_program_address(pool_seeds, program_id)?;
    msg!("derived pool pda : {}",pool_derived_pda);
    if *pool_pda.key!=pool_derived_pda{
        return Err(AmmError::LiqPoolPdaMismatch.into());
    }
    let mut pool_pda_data=LiquidityPool::try_from_slice(&pool_pda.data.borrow())?;

    let mut token_amountA_to_deposit:u64=0;
    let mut token_amountB_to_deposit:u64=0;
    let mut lp_tokens_to_mint_for_user:u64=0;
    msg!("a");
    if pool_pda_data.amountA==0 && pool_pda_data.amountB==0{
        token_amountA_to_deposit=depAmountA;
        token_amountB_to_deposit=depAmountB;
        lp_tokens_to_mint_for_user=((depAmountA*depAmountB) as f64).sqrt().floor() as u64;
        msg!("lp_tokens_to_mint_for_user : {}",lp_tokens_to_mint_for_user);
    }else{
        msg!("b");
        let pool_token_ratio=pool_pda_data.amountA/pool_pda_data.amountB;
        token_amountA_to_deposit=depAmountA;
        token_amountB_to_deposit=token_amountA_to_deposit/pool_token_ratio;
        if token_amountB_to_deposit>depAmountB{
            token_amountB_to_deposit=depAmountB;
            token_amountA_to_deposit=token_amountB_to_deposit*pool_token_ratio;
        }
        let lp_mint_data=Mint::unpack(&lp_mint.data.borrow())?;
        let total_lp_supply=lp_mint_data.supply;
        // lp_tokens_to_mint_for_user=(total_lp_supply/pool_pda_data.amountA)*token_amountA_to_deposit;
        let lp_cal=(total_lp_supply as u128 * token_amountA_to_deposit as u128) / (pool_pda_data.amountA as u128);
        lp_tokens_to_mint_for_user=lp_cal as u64;
        msg!("lp mint supply : {}",total_lp_supply);
        msg!("lp_tokens_to_mint_for_user : {}",lp_tokens_to_mint_for_user);
        // amountA in vault=1000, lp supply minted for these 1000 tokens a= 10000
        // then if i am depsoting 100 tokens, i should get 10000/1000*100=1000 lp tokens
    }
    let transfer_user_a_ata_to_vault_a_ix=transfer(&spl_token::ID,
        user_ata_a.key, pool_vault_ata_a.key,
        user.key, &[user.key], token_amountA_to_deposit)?;
    invoke(&transfer_user_a_ata_to_vault_a_ix, 
        &[user_ata_a.clone(),pool_vault_ata_a.clone(),user.clone(),user.clone(),token_prog.clone()])?;
    
    let transfer_user_b_ata_to_vault_b_ix=transfer(&spl_token::ID,
        user_ata_b.key, pool_vault_ata_b.key,
        user.key, &[user.key], token_amountB_to_deposit)?;
    invoke(&transfer_user_b_ata_to_vault_b_ix,
        &[user_ata_b.clone(),pool_vault_ata_b.clone(),user.clone(),user.clone(),token_prog.clone()])?;
    pool_pda_data.amountA+=token_amountA_to_deposit;
    pool_pda_data.amountB+=token_amountB_to_deposit;

    //now rewarding user lp tokens for providing liquidity to pool
    //first we will create user's ata for the lp mint
    //create lp mint ata for user if he is first time depsooting to pool
    if user_ata_lp_mint.data_is_empty() && user_ata_lp_mint.lamports()==0{
        let user_ata_for_lp_mint_create_ix=create_associated_token_account(user.key,
            user.key, lp_mint.key, &spl_token::ID);
        invoke(&user_ata_for_lp_mint_create_ix, 
            &[user.clone(),user_ata_lp_mint.clone(),user.clone(),lp_mint.clone(),
            system_prog.clone(),token_prog.clone(),ata_prog.clone()])?;
        msg!("user ata for lp mint created");
    } 

    let lp_mint_to_user_ix=mint_to(&spl_token::ID,
        lp_mint.key, user_ata_lp_mint.key,
        pool_pda.key, &[pool_pda.key], lp_tokens_to_mint_for_user)?;
    // invoke(&lp_mint_to_user_ix,
    //     &[lp_mint.clone(),user_ata_lp_mint.clone(),pool_pda.clone(),pool_pda.clone()])?;
    invoke_signed(&lp_mint_to_user_ix,
        &[lp_mint.clone(),user_ata_lp_mint.clone(),pool_pda.clone(),pool_pda.clone()],
        &[pool_seeds]
    )?;

    pool_pda_data.serialize(&mut *pool_pda.data.borrow_mut())?;
    Ok(())
}