use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::{ ProgramResult},
     msg, program::invoke, program_error::ProgramError, pubkey::Pubkey, 
     rent::Rent, system_instruction::create_account, sysvar::Sysvar,
     instruction::{AccountMeta,Instruction},
     system_program
};

entrypoint!(process_instruction);
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let doublePda=next_account_info(&mut account_iter)?;
    let doubleProgram=next_account_info(&mut account_iter)?;
    let systemProgram=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let ix=Instruction{
        program_id:*doubleProgram.key,
        accounts:vec![
            AccountMeta{pubkey:*user.key,is_signer:true,is_writable:true},
            AccountMeta{pubkey:*doublePda.key,is_signer:false,is_writable:true},
            AccountMeta{pubkey:solana_program::system_program::ID,is_signer:false,is_writable:false}
        ],
        data:instruction_data.to_vec()
    };
    invoke(&ix, &[user.clone(),doublePda.clone(),systemProgram.clone()])?;
    Ok(())
}
