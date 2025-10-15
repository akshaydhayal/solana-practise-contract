use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error,Debug)]
pub enum EscrowError{
    #[error("User given escrow pda does not match with Contract Escrow Pda")]
    VaultPdaMismatch
}

impl From<EscrowError> for ProgramError{
    fn from(e: EscrowError) -> Self{
        ProgramError::Custom(e as u32)
    }
}