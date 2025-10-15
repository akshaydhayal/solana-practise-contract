use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, clock::Clock, entrypoint::ProgramResult, msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey, rent::Rent, stake::{self, state::Stake}, system_instruction::{create_account, transfer}, system_program, sysvar::Sysvar
};
use crate::{error::StakeError, state::{StakeEntry, UnstakeEntry}};
use crate::state::StakeAccount;

pub fn init_stake_ix(program_id:&Pubkey, accounts:&[AccountInfo],bump:u8)->ProgramResult{
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
    if !stake_pda.data_is_empty(){
        return Err(StakeError::StakeAccountAlreadyInitialized.into());
    }
    let seeds=&[b"stake",user.key.as_ref(),&[bump]];
    let stake_derived_pda=Pubkey::create_program_address(seeds,program_id)?;
    if *stake_pda.key!=stake_derived_pda{
        return Err(StakeError::StakePdaMismatch.into());
    }
    let stake_pda_size:usize=32 + 32 + 32
                             + 4 + 5*16 //(max 5 stake entries)
                             + 4 + 5*16 //(max 5 unstake entries)
                             + 8;
    let rent=Rent::get()?;
    let stake_min_bal_for_rent_exemption=rent.minimum_balance(stake_pda_size);
    let stake_account_create_ix=create_account(user.key,
        stake_pda.key, stake_min_bal_for_rent_exemption,
        stake_pda_size as u64, program_id);
        
    invoke_signed(&stake_account_create_ix, 
        &[user.clone(),stake_pda.clone(),system_prog.clone()],
        &[seeds])?;
        msg!("stake pda is created!!");

    let stake_account_data=StakeAccount{
        staker:*user.key,
        withdraw_authority:*user.key,
        delegated_vote:Pubkey::default(),
        points:0,
        stakes:vec![],
        unstakes:vec![], 
    };
    stake_account_data.serialize(&mut *stake_pda.data.borrow_mut())?;
    msg!("stake account data updated");
    Ok(())
}