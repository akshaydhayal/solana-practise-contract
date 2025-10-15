use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
     entrypoint,entrypoint::{ProgramResult}, program::{invoke, invoke_signed}, 
     program_error::ProgramError, pubkey::Pubkey, rent::Rent,
      system_instruction::{create_account, transfer}, sysvar::Sysvar,msg
};

entrypoint!(process_instruction);

#[derive(BorshDeserialize,BorshSerialize)]
enum InstructionType{
    Init,
    Deposit(u32),
    Withdraw(u32)
}
#[derive(BorshDeserialize,BorshSerialize)]
struct Vault{
    owner:Pubkey,
    balance:u32
}

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    
    let instruction=InstructionType::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction{
        InstructionType::Init=>{
            init_vault(program_id,accounts)?;
        },
        InstructionType::Deposit(amount)=>{
            deposit_to_vault(program_id, accounts, amount)?;
        },
        InstructionType::Withdraw(amount)=>{
            withdraw_from_vault(program_id,accounts,amount)?;
        }
    }
    Ok(())
}

pub fn init_vault(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let vaultPda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if !vaultPda.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    let seeds=&[b"vault",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault",user.key.as_ref(),&[bump]];

    if *vaultPda.key!=expectedPda{
        return Err(ProgramError::InvalidSeeds);
    }

    let vault_space:usize=32+4;
    let rent=Rent::get()?;
    let vault_min_balance=rent.minimum_balance(vault_space);
    let ix=create_account(user.key, vaultPda.key, 
        vault_min_balance, vault_space as u64, program_id);
    invoke_signed(&ix,
        &[user.clone(),vaultPda.clone(),system_prog.clone()],
    &[seeds_with_bump])?;
    
    let mut vault_pda_data=Vault::try_from_slice(&vaultPda.data.borrow())?;
    vault_pda_data.owner=*user.key;
    vault_pda_data.balance=0;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}

pub fn deposit_to_vault(program_id:&Pubkey, accounts:&[AccountInfo],amount:u32)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let vaultPda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if vaultPda.owner!=program_id{
        return Err(ProgramError::IncorrectAuthority);
    }

    let seeds=&[b"vault",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault",user.key.as_ref(),&[bump]];

    if expectedPda!=*vaultPda.key{
        return Err(ProgramError::InvalidSeeds);
    }
    let ix=transfer(user.key, vaultPda.key, amount as u64);
    invoke(&ix, &[user.clone(),vaultPda.clone(),system_prog.clone()])?;

    // invoke_signed(&ix,
    //     &[user.clone(),vaultPda.clone(),system_prog.clone()],
    //     &[seeds_with_bump]
    // )?;
    let mut vault_pda_data=Vault::try_from_slice(& vaultPda.data.borrow())?;
    vault_pda_data.balance+=amount;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}

pub fn withdraw_from_vault(program_id:&Pubkey,accounts:&[AccountInfo],amount:u32)->ProgramResult{
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let vaultPda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    if vaultPda.owner!=program_id{
        return Err(ProgramError::IncorrectAuthority);
    }
    
    let seeds=&[b"vault",user.key.as_ref()];
    let (expectedPda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"vault",user.key.as_ref(),&[bump]];
    if expectedPda!=*vaultPda.key{
        return Err(ProgramError::InvalidSeeds);
    }
    //can't do transfer b/w accounts not owned by system program(so for pda's)
    // let ix=transfer(vaultPda.key,user.key,amount as u64);
    // invoke_signed(&ix,
    //     &[vaultPda.clone(),user.clone(),system_prog.clone()],
    //     &[seeds_with_bump]
    // )?;

    let vault_bal=**vaultPda.try_borrow_lamports()?;
    msg!("vault bal : {}",vault_bal);
    
    let rent=Rent::get()?;
    let vault_min_bal_for_rent_exemption=rent.minimum_balance(36 as usize);
    if vault_bal-(amount as u64) < vault_min_bal_for_rent_exemption{
        return Err(ProgramError::InsufficientFunds);
    }
    let vault_data_len=vaultPda.data_len();
    msg!("vault pda data len : {}",vault_data_len);
    
    **vaultPda.try_borrow_mut_lamports()?-=amount as u64;
    **user.try_borrow_mut_lamports()?+=amount as u64;

    let mut vault_pda_data=Vault::try_from_slice(&vaultPda.data.borrow())?;
    vault_pda_data.balance-=amount;
    vault_pda_data.serialize(&mut *vaultPda.data.borrow_mut())?;
    Ok(())
}