use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    entrypoint,entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    program::{invoke, invoke_signed},
    system_instruction::{create_account , transfer},
    account_info::{AccountInfo,next_account_info},
    rent::Rent, sysvar::Sysvar, msg
};

entrypoint!(process_instruction);

#[derive(BorshSerialize,BorshDeserialize)]
struct Multisig{
    owners:Vec<Pubkey>,
    // owners:Pubkey,
    threshold:u8,
    names:Vec<String>,
    proposals:Vec<Proposal>
}
// 32*5+1+10*201=     // 32*5+1+10*46=160+460+1
#[derive(BorshSerialize,BorshDeserialize)]
struct Proposal{
    reciever:Pubkey,
    amount:u64,
    approvals:Vec<bool>,   
    executed:bool,
}
// 32+8+1+5*32=192+9=201   // 32+8+1+5*1=192+9=46
#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init{owners:Vec<Pubkey>, threshold:u8,names:Vec<String>},
    // Init{owners:Vec<Pubkey>, threshold:u8},
    // Init{owners:Pubkey, threshold:u8},
    Deposit{amount:u64}
}

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    msg!("instruxtion data: {:?}",instruction_data);
    let instruction=InstructionType::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction{
        InstructionType::Init {owners, threshold ,names}=>{
            msg!("init multisig ix called");
            init_multisig(program_id,accounts, owners, threshold,names)?;
        },
        InstructionType::Deposit{amount}=>{
            deposit_to_multisig(program_id,accounts,amount)?;
        }
    }
    Ok(())
}

pub fn init_multisig(program_id:&Pubkey, accounts:&[AccountInfo], owners:Vec<Pubkey>, threshold:u8,names: Vec<String>)->ProgramResult{
// pub fn init_multisig(program_id:&Pubkey, accounts:&[AccountInfo], owners:Pubkey, threshold:u8)->ProgramResult{
    msg!("a0");
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let multisig_pda=next_account_info(&mut account_iter)?;
    let vault_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    msg!("a");
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    msg!("b");
    let seeds=&[b"multisig",user.key.as_ref()];
    let (multisig_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"multisig",user.key.as_ref(),&[bump]];
    if *multisig_pda.key!=multisig_derived_pda{
        return Err(ProgramError::InvalidAccountOwner);
    }
    msg!("c");
    let proposal_size:usize=32+8+1+5;  //assuming max owners are capped at 5
    // let multisig_size:usize=32*5+1+10*proposal_size;  //assuming max proposals to be 10 initially
    let multisig_size:usize=4+32*1+
                            1+
                            4+2*1+4*2+
                            4;  //assuming max proposals to be 10 initially
    let rent=Rent::get()?;
    let pda_rent_exempt_bal=rent.minimum_balance(multisig_size);
    
    msg!("d");
    let pda_create_ix=create_account(user.key,
        &multisig_derived_pda, pda_rent_exempt_bal,
        multisig_size as u64, program_id);
        invoke_signed(&pda_create_ix,
            &[user.clone(),multisig_pda.clone(),system_prog.clone()],
            &[seeds_with_bump])?;
            msg!("multisig pda account created!!");
            
    msg!("e");
    // let multisig_pda_data=Multisig{owners,threshold,proposals:Vec::new()};
    let multisig_pda_data=Multisig{owners,threshold,names,proposals:Vec::new()};
    multisig_pda_data.serialize(&mut *multisig_pda.data.borrow_mut())?;
    msg!("multisig pda acount initialised!!");

    Ok(())
}

pub fn deposit_to_multisig(program_id:&Pubkey, accounts:&[AccountInfo],amount:u64)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let multisig_pda=next_account_info(&mut account_iter)?;
    let vault_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    
    let seeds=&[b"vault".as_ref()];
    let (vault_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault".as_ref(),&[bump]];

    if vault_derived_pda!=*vault_pda.key{
       return Err(ProgramError::InvalidAccountOwner);
    }
    //we create a vualt pda for the first deposit and no pda create for later deposits
    if vault_pda.data_is_empty() && vault_pda.lamports()==0{
        // return Err(ProgramError::AccountAlreadyInitialized);
        let vault_create_ix=create_account(user.key,
            &vault_derived_pda, Rent::get()?.minimum_balance(0 ),
            0, program_id);
        invoke_signed(&vault_create_ix,
            &[user.clone(),vault_pda.clone(),system_prog.clone()],
            &[seeds_with_bump])?;
        msg!("vault pda created!!");
    }
    let transfer_ix=transfer(user.key, &vault_derived_pda, amount);
    invoke(&transfer_ix, &[user.clone(),vault_pda.clone(),system_prog.clone()])?;
    msg!("deposited {} lamports from {} to {}",amount,user.key,vault_derived_pda);

    Ok(())
}