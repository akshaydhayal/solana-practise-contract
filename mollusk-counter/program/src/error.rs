use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CounterError{
    #[error("given Counter pda don't match with derived counter pda")]
    PdaMismatch
}

impl From<CounterError> for ProgramError{
   fn from(e:CounterError)->Self{
    ProgramError::Custom(e as u32)
   }
}