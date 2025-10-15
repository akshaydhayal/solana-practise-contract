pub mod instruction;
pub mod state;
pub mod constants;
pub mod processor;
pub mod instructions;

use solana_program::{entrypoint};
use processor::process_instruction;

entrypoint!(process_instruction);

