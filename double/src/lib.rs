use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},entrypoint, entrypoint::{ProgramResult}, 
    msg, program::{invoke, invoke_signed}, program_error::ProgramError, 
    pubkey::Pubkey, rent::Rent, system_instruction::create_account,
    system_program, sysvar::Sysvar
};

entrypoint!(process_instruction);

#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init,
    Double,
    Half
}
#[derive(BorshSerialize,BorshDeserialize)]
struct Counter{
    value:u32
}

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let doublePda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    msg!("a");
    let seeds=&[b"double",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds,program_id);
    
    if expectedPda!=*doublePda.key{
        return Err(ProgramError::InvalidSeeds);
    }
    msg!("b");
    let instruction=InstructionType::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

match instruction{
    InstructionType::Init=>{
            msg!("c");
            if !doublePda.data_is_empty(){
                return Err(ProgramError::AccountAlreadyInitialized);
            }
            if *system_prog.key!=solana_program::system_program::ID{
                return Err(ProgramError::IncorrectProgramId);
            }
            msg!("d");
            let rent=Rent::get()?;
            let min_bal=rent.minimum_balance(4);
            let ix=create_account(user.key, doublePda.key, min_bal, 4, program_id);
            let seeds_with_bump=&[b"double",user.key.as_ref(),&[bump]];
            msg!("e");
            invoke_signed(&ix, 
                &[user.clone(),doublePda.clone(),system_prog.clone()],
                &[seeds_with_bump])?;
            let mut doublePdaData=Counter::try_from_slice(&doublePda.data.borrow())?;
            doublePdaData.value=1;
            doublePdaData.serialize(&mut *doublePda.data.borrow_mut())?; 
        },
        InstructionType::Double=>{
            msg!("f");
            if doublePda.owner!=program_id{
                return Err(ProgramError::IncorrectAuthority);
            }
            let mut doublePdaData=Counter::try_from_slice(&doublePda.data.borrow())?;
            msg!("g");
            doublePdaData.value*=2;
            doublePdaData.serialize(&mut *doublePda.data.borrow_mut())?;
            msg!("h");
        },
        InstructionType::Half=>{
            if doublePda.owner!=program_id{
                return Err(ProgramError::IncorrectAuthority);
            }
            let mut doublePdaData=Counter::try_from_slice(&doublePda.data.borrow())?;
            doublePdaData.value/=2;
            doublePdaData.serialize(&mut *doublePda.data.borrow_mut())?;
        }
    }
    Ok(())
}