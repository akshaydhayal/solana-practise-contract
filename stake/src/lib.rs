pub mod instruction;
pub mod processor;
pub mod error;
pub mod state;
pub mod instructions;
pub mod constants;

use solana_program::entrypoint;
use crate::processor::process_instruction;

entrypoint!(process_instruction);