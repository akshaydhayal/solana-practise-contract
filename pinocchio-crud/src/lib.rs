use pinocchio::{
    account_info::AccountInfo, entrypoint, msg, program_error::ProgramError, pubkey::Pubkey, ProgramResult
};
use borsh::{BorshSerialize, BorshDeserialize};
use pinocchio_pubkey::declare_id;
use shank::{ShankInstruction, ShankAccount};

entrypoint!(process_instruction);
declare_id!("HTHYhmbNLvZmFJQD65icHSoSHr1rp3G7ejJQD7iYc6mM");

#[derive(BorshSerialize, BorshDeserialize, ShankInstruction)]
pub enum InstructionType{
    Create,
    Update
}

#[derive(BorshSerialize,BorshDeserialize)]
pub struct User{
    pub key:Pubkey,
    pub val:u32
}

pub fn process_instruction(
    program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8]
)->ProgramResult{
    let [user]=accounts else{
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    let ix=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    // let mut user_data=User::try_from_slice(&userPda.try_borrow_data()?)?;
    match ix{
        InstructionType::Create=>{msg!("create ix")},
        InstructionType::Update=>{msg!("update ix")}
    };
    Ok(())
}
