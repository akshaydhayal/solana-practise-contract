use solana_program::{
    account_info::{next_account_info, AccountInfo}, borsh1::try_from_slice_unchecked, entrypoint::ProgramResult, program_error::ProgramError, pubkey::Pubkey
};

use crate::{error::StakeError, state::StakeAccount};

pub fn close_stake_account_ix(program_id:&Pubkey, accounts:&[AccountInfo],bump:u8)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let stake_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let seeds=&[b"stake",user.key.as_ref(),&[bump]];
    let stake_derived_pda=Pubkey::create_program_address(seeds, program_id)?;
    if stake_derived_pda!=*stake_pda.key{
        return Err(StakeError::StakePdaMismatch.into());
    }
    let stake_account_data:StakeAccount=try_from_slice_unchecked(&stake_pda.data.borrow())?;
    **user.try_borrow_mut_lamports()?+=stake_pda.lamports();
    **stake_pda.try_borrow_mut_lamports()?=0;
    // stake_pda.realloc(0, true);
    // stake_pda.assign(system_prog.key);
    Ok(())
}