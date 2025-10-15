use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error,Debug)]
pub enum AmmError{
    #[error("pda mismatch")]
    LiqPoolPdaMismatch
}

impl From<AmmError> for ProgramError{
    fn from(e:AmmError)->Self{
        ProgramError::Custom(e as u32)
    }
}