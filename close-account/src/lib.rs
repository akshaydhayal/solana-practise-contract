use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    // program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction::create_account,
    program::invoke_signed,
};

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}
#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init{val:u32},
    Close
}
// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");

    let accounts_iter = &mut accounts.iter();
    let user = next_account_info(accounts_iter)?;
    let account = next_account_info(accounts_iter)?;
    let system_prog = next_account_info(accounts_iter)?;

    let instruction=InstructionType::try_from_slice(_instruction_data)?;
    match instruction{
        InstructionType::Init { val }=>{
            let seeds=&[b"user",user.key.as_ref()];
            let (derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
            let seeds_with_bump=&[b"user",user.key.as_ref(),&[bump]];
            msg!("derived pda : {}",derived_pda);
            let ix=create_account(user.key
                ,account.key, 100000000, 4, program_id);
            msg!("a");
            invoke_signed(&ix,
             &[user.clone(),account.clone(),system_prog.clone()],
             &[seeds_with_bump])?;

            let greeting_account=GreetingAccount{counter:val};
            greeting_account.serialize(&mut *account.data.borrow_mut())?;

            msg!("Greeted {} time(s)!", greeting_account.counter);

        },
        InstructionType::Close=>{
            msg!("account closing ix called");
            **user.try_borrow_mut_lamports()?+=account.lamports();
            **account.try_borrow_mut_lamports()?=0;
            msg!("account closed");
        }
    }
    Ok(())
}