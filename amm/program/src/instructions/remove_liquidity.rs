use solana_program::{
    pubkey::Pubkey,
    account_info::{AccountInfo,next_account_info},
    program_error::ProgramError,
    entrypoint::ProgramResult,
    program::{invoke,invoke_signed},
    program_pack::Pack,
    msg
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::{error::AmmError, state::LiquidityPool};
use spl_token::{
    instruction::{transfer,burn,burn_checked},
    state::Mint
};

pub fn remove_liquidity(program_id:&Pubkey,accounts:&[AccountInfo], lp_amount_burn:u64, pool_bump:u8)->ProgramResult{
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
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if *token_prog.key!=spl_token::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    let pool_seeds=&[b"pool",mint_a.key.as_ref(),mint_b.key.as_ref(),user.key.as_ref(),&[pool_bump]];
    let pool_derived_pda=Pubkey::create_program_address(pool_seeds,program_id)?;
    if *pool_pda.key!=pool_derived_pda{
        return Err(AmmError::LiqPoolPdaMismatch.into());
    }
    let mut pool_pda_data=LiquidityPool::try_from_slice(&pool_pda.data.borrow())?;
    let mut pool_pda_data2=LiquidityPool::unpack_from_slice(&pool_pda.data.borrow())?;
    // msg!("pool pda data : {:?}",pool_pda_data);
    // msg!("pool pda data2 : {:?}",pool_pda_data2);

    let pool_buffer_data1=pool_pda.data.borrow();
    // msg!("pool buffer data1 : {:?}",pool_buffer_data1);
    let mut pool_buffer_data2:[u8;146]=[0;146];
    pool_pda_data2.pack_into_slice(&mut pool_buffer_data2);
    // msg!("pool buffer data2 :{:?}",pool_buffer_data2);
    msg!("both buffer data equal :{}",**pool_buffer_data1==pool_buffer_data2);


    // major parts in this ix:
    // 1. Transfer token a and b from vault ata to user's ata
    // 2. burn user lp tokens

    // Checks
    // 1. he has suffieicne tlp tokens that he wants to burn


    let lp_mint_data=Mint::unpack(&lp_mint.data.borrow())?;
    let lp_mint_supply=lp_mint_data.supply;
    //precision loss in a/b if a<b
    // let token_a_amount_to_withdraw=burn_lp_amount/lp_mint_supply*pool_pda_data.amountA;
    //but caresult can overflow in this also in a*b/c if a and b both are u64, a*b can be u128, so use
    //u128 for intermediate maths 
    // let token_a_amount_to_withdraw=burn_lp_amount*pool_pda_data.amountA/lp_mint_supply;
    let token_a_amount_to_withdraw=((lp_amount_burn as u128) * (pool_pda_data.amountA as u128 ) / (lp_mint_supply as u128)) as u64;
    let token_b_amount_to_withdraw=((lp_amount_burn as u128) * (pool_pda_data.amountB as u128 ) / (lp_mint_supply as u128)) as u64;

    let transfer_vault_ata_a_to_user_ata_a_ix=transfer(&spl_token::ID,
        pool_vault_ata_a.key, user_ata_a.key,
        pool_pda.key, &[], token_a_amount_to_withdraw)?;
    //invoke should fail as we need to sign this ix using pool pda seeds as pool pda needs to be signer here
    // signer pubkeys are for multisig authority
    invoke_signed(&transfer_vault_ata_a_to_user_ata_a_ix,
        &[pool_vault_ata_a.clone(),user_ata_a.clone(),pool_pda.clone(),
        pool_pda.clone(),token_prog.clone()],
        &[pool_seeds])?;

    let transfer_vault_ata_b_to_user_ata_b_ix=transfer(&spl_token::ID,
        pool_vault_ata_b.key,user_ata_b.key,
        pool_pda.key,&[],token_b_amount_to_withdraw)?;
    invoke_signed(&transfer_vault_ata_b_to_user_ata_b_ix,
        &[user_ata_b.clone(),pool_vault_ata_b.clone(),pool_pda.clone(),token_prog.clone()],
        &[pool_seeds])?;

    //burn user lp tokens
    let burn_ix=burn_checked(&spl_token::ID,
        user_ata_lp_mint.key, lp_mint.key, user.key,
        &[], lp_amount_burn, 5)?;
    invoke(&burn_ix,
        &[user_ata_lp_mint.clone(),lp_mint.clone(),user.clone(),token_prog.clone()])?;

    //update data inside the pool pda data
    pool_pda_data2.amountA-=token_a_amount_to_withdraw;
    pool_pda_data2.amountB-=token_b_amount_to_withdraw;
        
    // pool_pda_data.serialize(&mut *pool_pda.data.borrow_mut())?;
    // let x=pool_pda.data.borrow_mut();
    // msg!("{:?}",x);
    
    // pool_buffer_data2::pack_into_slice()
    LiquidityPool::pack_into_slice(&pool_pda_data2,&mut *pool_pda.data.borrow_mut());
    Ok(())
}