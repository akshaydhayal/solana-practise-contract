use borsh::BorshDeserialize;
use solana_program::{
    entrypoint::ProgramResult,
    pubkey::Pubkey, msg,
    account_info::{AccountInfo, next_account_info},
    program_error::ProgramError
};
use crate::instruction::InstructionType;
use crate::instructions::{
    init_escrow::init_escrow,
    accept_escrow_offer::accept_escrow_offer
};

pub fn process_instruction(
    program_id:&Pubkey, 
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{

    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    match instruction{
        InstructionType::InitEscrow { amount_x,amount_y ,escrow_id}=>{
            msg!("escrow init ix called");
            init_escrow(program_id,accounts,amount_x,amount_y,escrow_id)?;
        },
        InstructionType::AcceptEscrowOffer{escrow_id}=>{
            msg!("accept escrow offer ix called!");
            accept_escrow_offer(program_id,accounts,escrow_id)?;
        }
    }
    Ok(())
}