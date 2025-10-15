use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{ 
    account_info::{next_account_info, AccountInfo},entrypoint, entrypoint::{ ProgramResult}, program::invoke_signed, program_error::ProgramError, pubkey::{Pubkey, PubkeyError}, system_instruction::create_account
};
pub mod error;
use crate::error::CounterError;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Counter{
    value:u32
}

#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init{value:u32}
}

entrypoint!(process_instruction);

pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{
    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let counter_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;

    match instruction{
        InstructionType::Init { value }=>{
            let counter=Counter{value};
            let seeds=&[b"counter",user.key.as_ref()];
            let (counter_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
            let seeds_with_bump=&[b"counter",user.key.as_ref(),&[bump]];
            if counter_derived_pda!=*counter_pda.key{
                return Err(CounterError::PdaMismatch.into());
            }
            let create_ix=create_account(user.key,
                &counter_derived_pda, 918720, 4, program_id);
            invoke_signed(&create_ix,
                &[user.clone(),counter_pda.clone(),system_prog.clone()],
                &[seeds_with_bump])?;
            counter.serialize(&mut *counter_pda.data.borrow_mut())?;
        }
    }
    Ok(())
}










// pub fn add(left: u64, right: u64) -> u64 {
//     left + right
// }

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn it_works() {
//         let result = add(2, 2);
//         assert_eq!(result, 4);
//     }
// }
