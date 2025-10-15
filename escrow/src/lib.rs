pub mod processor;
pub mod state;
pub mod instruction;
pub mod error;
pub mod instructions;

use solana_program::entrypoint;

use crate::processor::process_instruction;
entrypoint!(process_instruction);
