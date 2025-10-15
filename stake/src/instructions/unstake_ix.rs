use std::ops::Add;

use solana_program::{
    account_info::{next_account_info, AccountInfo}, borsh1::try_from_slice_unchecked, clock::Clock, compute_units::sol_remaining_compute_units, entrypoint::ProgramResult, log::{sol_log,sol_log_compute_units,sol_log_data}, msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey, rent::Rent, system_instruction::{create_account_with_seed, transfer, transfer_with_seed}, system_program, sysvar::Sysvar
};
use borsh::{BorshDeserialize, BorshSerialize};
// use crate::{error::StakeError, state::{StakeAccount, StakeState}};
use crate::{error::StakeError, state::{StakeAccount, UnstakeEntry}};
use crate::constants::POINTS_PER_SECOND_PER_LAMPORT;

pub fn unstake_ix(program_id:&Pubkey, accounts:&[AccountInfo], bump:u8,amount:u64)->ProgramResult{

    let mut accounts_iter=accounts.iter();
    let user=next_account_info(&mut accounts_iter)?;
    let stake_pda=next_account_info(&mut accounts_iter)?;
    let system_prog=next_account_info(&mut accounts_iter)?;

    // user.data
    // 890880 0 bytes
    // 897840 1 byte,
    // 904800 2 byte
    // 6960 lamports req per byte
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }    
    if *system_prog.key!=system_program::id(){
        return Err(StakeError::WrongSystemProgramProvided.into());
    }
    if stake_pda.owner!=program_id{
        return Err(StakeError::StakePdaNotOwnedByProgram.into());
    }
    msg!("remaining compute units2 : {}",sol_remaining_compute_units());
    
    let seeds=&[b"stake",user.key.as_ref()];
    let seeds_with_bump=&[b"stake",user.key.as_ref(),&[bump]];
    // let (stake_derived_pda,bump)=Pubkey::find_program_address(seeds,program_id);
    let stake_derived_pda=Pubkey::create_program_address(seeds_with_bump,program_id)?;

    if stake_derived_pda!=*stake_pda.key{
        return Err(StakeError::StakePdaMismatch.into());
    }
    msg!("remaining compute units3 :  {}",sol_remaining_compute_units());

    // let mut stake_account_data=StakeAccount::try_from_slice(&stake_pda.data.borrow())?;
    let mut stake_account_data:StakeAccount=try_from_slice_unchecked(&stake_pda.data.borrow())?;
    let stake_pda_size=stake_pda.data_len();
    let stake_pda_bal_after_unstake=stake_pda.lamports()-amount;

    let rent=Rent::get()?;
    if !rent.is_exempt(stake_pda_bal_after_unstake, stake_pda_size){
        return Err(StakeError::StakePdaInsufficientFundsForRent.into());
    }
    let x:Vec<u64>=stake_account_data.stakes.iter()
                                        .map(|i| i.stake_amount)
                                        .collect();
    let stakes_sum=x.iter().sum::<u64>();

    if amount>stakes_sum{
        return Err(StakeError::UnstakingMoreThanStaked.into());
    }
    if stake_account_data.withdraw_authority!=*user.key{
        return Err(StakeError::WrongStakeAuthority.into());
    }

    // 1 2 3
    // 4
    let clock=Clock::get()?;
    let mut amount_unstaking=amount;
    let mut points_for_unstaking_amount:i64=0;
    
    for i in (0..stake_account_data.stakes.len()).rev(){
        let stake_idx_amount=stake_account_data.stakes[i].stake_amount;
        let stake_idx_time=stake_account_data.stakes[i].stake_time;

        if amount_unstaking<stake_idx_amount{
            stake_account_data.stakes[i].stake_amount-=amount_unstaking;
            points_for_unstaking_amount += (amount_unstaking as i64) * (clock.unix_timestamp-stake_idx_time) * POINTS_PER_SECOND_PER_LAMPORT;
            let unstake_entry=UnstakeEntry{
                unstake_amount:amount,
                unstake_time:clock.unix_timestamp
            };
            stake_account_data.unstakes.push(unstake_entry);
            break;
        }else{
            amount_unstaking-=stake_idx_amount;
            points_for_unstaking_amount += (stake_idx_amount as i64) * (clock.unix_timestamp-stake_idx_time) * POINTS_PER_SECOND_PER_LAMPORT;
            stake_account_data.stakes.pop();
        }
    }


    // stake_account_data.staked_amount-=amount;
    // stake_account_data.unstaked_cooldown_amount+=amount;
    // stake_account_data.state=StakeState::Cooldown;

    // stake_account_data.unstaked_time=clock.unix_timestamp;
    // let total_staked_time=stake_account_data.unstaked_time-stake_account_data.staked_time;
    // stake_account_data.points+=total_staked_time * POINTS_PER_SECOND_PER_LAMPORT*(amount as i64);
    stake_account_data.points+=points_for_unstaking_amount;
    // stake_account_data.staked_time=0;

    sol_log_compute_units();
    stake_account_data.serialize(&mut *stake_pda.data.borrow_mut())?;    
    Ok(())
}
