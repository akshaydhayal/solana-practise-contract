use solana_program::{program_error::ProgramError, stake::state::Stake};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StakeError{
    #[error("User gave wrong system program")]
    WrongSystemProgramProvided,
    
    #[error("User Stake pda accunt is already initialized")]
    StakeAccountAlreadyInitialized,
    
    #[error("Given Stake pda account does not belongs to user")]
    StakePdaMismatch,

    #[error("given stake pda is not owned by program")]
    StakePdaNotOwnedByProgram,

    #[error("Stake pda insfuffient funds for Rent")]
    StakePdaInsufficientFundsForRent,

    #[error("can unstake more than staked amount")]
    UnstakingMoreThanStaked,

    #[error("You are not authorised to unstake or withdraw")]
    WrongStakeAuthority,

    #[error("Cooling time not passed after unstake for Withdrawls")]
    CoolingTimeNotPassedAfterUnstake,

    #[error("max 5 partial stake entries allowed at a time")]
    StakeEntriesExceededFive,

    #[error("max 5 partial unstake entries allowed at a time")]
    UnstakeEntriesExceededFive,
}

impl From<StakeError> for ProgramError{
    fn from(e:StakeError)->Self{
        ProgramError::Custom(e as u32)
    }
}