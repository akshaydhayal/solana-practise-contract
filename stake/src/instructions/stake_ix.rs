// use solana_program::

use borsh::{try_to_vec_with_schema, BorshDeserialize};
use borsh::ser::BorshSerialize;
use solana_program::borsh1::try_from_slice_unchecked;
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, 
    msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey,
     rent::Rent, stake::state::Stake, system_instruction::{create_account, transfer},
      system_program, sysvar::Sysvar,clock::Clock
};
// use crate::{error::StakeError, state::StakeState};
use crate::{error::StakeError};
use crate::state::{StakeAccount, StakeEntry};

pub fn stake_ix(program_id:&Pubkey, accounts:&[AccountInfo],amount:u64)->ProgramResult{
    let mut accounts_iter=accounts.iter();
    let user=next_account_info(&mut accounts_iter)?;
    let stake_pda=next_account_info(&mut accounts_iter)?;
    let system_prog=next_account_info(&mut accounts_iter)?;
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=system_program::ID{
        return Err(StakeError::WrongSystemProgramProvided.into());
    }
    if stake_pda.owner!=program_id{
        return Err(StakeError::StakePdaNotOwnedByProgram.into());
    }
    
    let stake_seeds=&[b"stake",user.key.as_ref()];
    let (stake_derived_pda,bump)=Pubkey::find_program_address(stake_seeds, program_id);
    let stake_seeds_with_bump=&[b"stake",user.key.as_ref(),&[bump]];
    if stake_derived_pda!=*stake_pda.key{
        return Err(StakeError::StakePdaMismatch.into());
    }
    
    let user_transfer_to_stake_account_ix=transfer(user.key, 
        stake_pda.key, amount);
    invoke(&user_transfer_to_stake_account_ix,
        &[user.clone(),stake_pda.clone()])?;
    msg!("{} amount has been moved to stake account",amount);

    let clock=Clock::get()?;
    msg!("unix time : {}",clock.unix_timestamp);
    msg!("slot : {}",clock.slot);
  
    // let mut stake_account_data=StakeAccount::try_from_slice(&stake_pda.data.borrow())?;
    let mut stake_account_data:StakeAccount=try_from_slice_unchecked(&stake_pda.data.borrow())?;
    if stake_account_data.stakes.len()>=5{
        return Err(StakeError::StakeEntriesExceededFive.into());
    }
    let stake_entry=StakeEntry{
        stake_amount:amount,
        stake_time:clock.unix_timestamp
    };
    stake_account_data.stakes.push(stake_entry);
    msg!("stake account : {:?}",stake_account_data);
    stake_account_data.serialize(&mut *stake_pda.data.borrow_mut())?;
    msg!("stake account data updated");
    Ok(())
}


// stakes  :  [ {5,101} , {10, 110} , {5, 120} ] reduce from end and remove if val=0
// unstakes:  [ {4, 125} ]