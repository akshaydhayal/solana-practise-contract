use solana_program::{
    account_info::{next_account_info, AccountInfo},
     borsh1::try_from_slice_unchecked, clock::Clock, entrypoint::ProgramResult,
      msg, program_error::ProgramError, pubkey::Pubkey, stake, system_program,
       sysvar::Sysvar
       
};
use borsh::{BorshSerialize,BorshDeserialize};
use crate::{constants::COOLING_UNSTAKE_TIME_TO_ALLOW_WITHDRAW, error::StakeError, state::UnstakeEntry};
use crate::state::{StakeAccount};

pub fn withdraw_ix(program_id:&Pubkey,accounts:&[AccountInfo],bump:u8)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let stake_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=system_program::ID{
        return Err(StakeError::WrongSystemProgramProvided.into());
    }
    if stake_pda.owner!=program_id{
        return Err(StakeError::StakePdaNotOwnedByProgram.into());
    }
    let seeds=&[b"stake",user.key.as_ref(),&[bump]];
    let stake_derived_pda=Pubkey::create_program_address(seeds,program_id)?;
    if stake_derived_pda!=*stake_pda.key{
        return Err(StakeError::StakePdaMismatch.into());
    }
    // let mut stake_account_data=StakeAccount::try_from_slice(&stake_pda.data.borrow())?;
    let mut stake_account_data:StakeAccount=try_from_slice_unchecked(&stake_pda.data.borrow())?;
    let clock=Clock::get()?;
    if stake_account_data.withdraw_authority!=*user.key{
        return Err(StakeError::WrongStakeAuthority.into());
    }
    // stake_pda.try_borrow_mut_lamports()?.checked_sub(stake_account_data.unstaked_cooldown_amount);
    let mut total_withdrawable_amount:u64=0;
    for i in 0..stake_account_data.unstakes.len(){
        let time_passed_after_unstaking=clock.unix_timestamp - stake_account_data.unstakes[i].unstake_time;
        if time_passed_after_unstaking>=COOLING_UNSTAKE_TIME_TO_ALLOW_WITHDRAW{
            total_withdrawable_amount+=stake_account_data.unstakes[i].unstake_amount;
            stake_account_data.unstakes[i].unstake_amount=0;
            stake_account_data.unstakes[i].unstake_time=0;
        }
    }
    let updated_unstaked:Vec<UnstakeEntry>=stake_account_data.unstakes.iter()
                                .filter(|&i| i.unstake_amount>0)
                                .cloned()
                                .collect();
    stake_account_data.unstakes=updated_unstaked;
    **stake_pda.try_borrow_mut_lamports()?-=total_withdrawable_amount;
    **user.try_borrow_mut_lamports()?+=total_withdrawable_amount;
    stake_account_data.serialize(&mut *stake_pda.data.borrow_mut())?;
    Ok(())
}