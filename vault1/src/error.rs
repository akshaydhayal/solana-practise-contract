use thiserror::Error;
use solana_program::{
    program_error::ProgramError
};

#[derive(Debug,Error)]
pub enum VaultError{
    
    #[error("vault access is unauthorized")]
    UnAuthorized,
    
    #[error("vault is locked")]
    VaultLocked,
    
    #[error("invalid instruction data")]
    InvalidInstructionData,

    #[error("not enough funds")]
    InSufficientFunds
}
impl From<VaultError> for ProgramError{
    fn from(e: VaultError) -> Self {
        ProgramError::Custom(e as u32)
    }
}