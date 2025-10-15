use solana_program::{entrypoint};
use borsh::{BorshDeserialize,BorshSerialize};

pub mod processor;
pub mod state;
pub mod instruction;
// pub mod error;
pub mod error;
pub mod constants;
pub mod instructions;

use crate::processor::process_instruction;
entrypoint!(process_instruction);

