use solana_program::{
    entrypoint, entrypoint::ProgramResult,
    pubkey::Pubkey,
    account_info::AccountInfo
};
use borsh::{BorshSerialize,BorshDeserialize};

entrypoint!(process_instruction);
#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init
}
#[derive(BorshSerialize)]
pub struct Data{
    name:String,
    likes:Vec<String>
}

program_id!("a");
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    let ix=InstructionType::try_from_slice(instruction_data);
    let data=Data{
        name:"Akshay".to_string(),
        likes:vec!["a".to_string(),"b".to_string()]
    };
    let x=borsh::to_vec(&data)?.len();
    let y=6;
    let z=borsh::to_vec(&y)?;

    // std::mem::size
    let a=size_of::<Data>();
    Ok(())
}