use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, borsh1::try_from_slice_unchecked, entrypoint, entrypoint::{ProgramResult}, msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey, rent::Rent, system_instruction::{create_account , transfer}, sysvar::Sysvar
};

entrypoint!(process_instruction);

#[derive(BorshSerialize,BorshDeserialize,Debug)]
struct Multisig{
    owner1:Pubkey,
    owner2:Pubkey,
    owner3:Pubkey,
    owner4:Pubkey,
    owner5:Pubkey,
    threshold:u8,
    proposals:Vec<Proposal>
}
// 32*5+1+10*201=     // 32*5+1+10*46=160+460+1
#[derive(BorshSerialize,BorshDeserialize,Debug)]
struct Proposal{
    reciever:Pubkey,
    amount:u64,
    approvals:Vec<bool>,   
    executed:bool,
}
// 32+8+1+5*32=192+9=201   // 32+8+1+5*1=192+9=46
#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    Init{owner1:Pubkey, owner2:Pubkey, owner3:Pubkey,owner4:Pubkey,owner5:Pubkey, threshold:u8},
    Deposit{amount:u64},
    CreateWithdrawProposal{reciever:Pubkey,amount:u64},
    ApproveWithdrawProposal{proposal_index:u8},
    ClaimWithdrawProposal{proposal_index:u8},

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
        InstructionType::Init {owner1,owner2,owner3,owner4,owner5, threshold }=>{
            msg!("init multisig ix called");
            init_multisig(program_id,accounts, owner1,owner2,owner3,owner4,owner5, threshold)?;
        },
        InstructionType::Deposit{amount}=>{
            deposit_to_multisig(program_id,accounts,amount)?;
        },
        InstructionType::CreateWithdrawProposal { reciever, amount }=>{
            msg!("create withdraw proposa called");
            create_withdraw_proposal(program_id,accounts,reciever,amount)?;
        },
        InstructionType::ApproveWithdrawProposal { proposal_index }=>{
            msg!("approve proposa ix called");
            approve_withdraw_proposal(program_id,accounts,proposal_index)?;
        },
        InstructionType::ClaimWithdrawProposal { proposal_index }=>{
            msg!("claim proposa ix called");
            claim_withdraw_proposal(program_id,accounts,proposal_index)?;
        }
    }
    Ok(())
}

pub fn init_multisig(program_id:&Pubkey, accounts:&[AccountInfo], 
    owner1:Pubkey, owner2:Pubkey,owner3:Pubkey,owner4:Pubkey,owner5:Pubkey, threshold:u8)->ProgramResult{
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
    //question - is this good architecture to avoid user key in multisig pda so that all owners 
    //can derive it onchain ahead og program
    // let seeds=&[b"multisig",user.key.as_ref()];
    let seeds=&[b"multisig".as_ref()];
    let (multisig_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
    let seeds_with_bump=&[b"multisig".as_ref(),&[bump]];
    // let seeds_with_bump=&[b"multisig",user.key.as_ref(),&[bump]];
    if *multisig_pda.key!=multisig_derived_pda{
        return Err(ProgramError::InvalidAccountOwner);
    }


    let proposal_size:usize=32 + 8 + 1 + 4 + 5*1;  //assuming max owners are capped at 5
    let multisig_size:usize=32*5 + 1 + 4 + 1*proposal_size;  //assuming max proposals to be 10 initially
    let rent=Rent::get()?;
    let pda_rent_exempt_bal=rent.minimum_balance(multisig_size);
    
    let pda_create_ix=create_account(user.key,
        &multisig_derived_pda, pda_rent_exempt_bal,
        multisig_size as u64, program_id);
        invoke_signed(&pda_create_ix,
            &[user.clone(),multisig_pda.clone(),system_prog.clone()],
            &[seeds_with_bump])?;
            msg!("multisig pda account created!!");
            
    let multisig_pda_data=Multisig{owner1,owner2,owner3,owner4,owner5,threshold,proposals:Vec::new()};
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
    msg!("vault pda lamports before transfer : {}",vault_pda.lamports());
    msg!("vault pda data len : {}",vault_pda.data_len());

    let transfer_ix=transfer(user.key, &vault_derived_pda, amount);
    invoke(&transfer_ix, &[user.clone(),vault_pda.clone(),system_prog.clone()])?;
    msg!("deposited {} lamports from {} to {}",amount,user.key,vault_derived_pda);

    Ok(())
}

pub fn create_withdraw_proposal(program_id:&Pubkey,accounts:&[AccountInfo],reciever:Pubkey,amount:u64)->ProgramResult{
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
    let seeds=&["multisig".as_bytes()];
    let (multisig_derived_pda,bump)=Pubkey::find_program_address(seeds,program_id);
    if multisig_derived_pda!=*multisig_pda.key{
        return Err(ProgramError::InvalidAccountOwner);
    }
    msg!("c");
    msg!("multisig pda data len : {}",multisig_pda.data_len());
    let mut multisig_pda_data:Multisig=try_from_slice_unchecked(&multisig_pda.data.borrow())?;
    // let mut multisig_pda_data=Multisig::try_from_slice(&multisig_pda.data.borrow())?;
    msg!("d0");
    let withdraw_proposal:Proposal;
    msg!("d");
    if multisig_pda_data.owner1==*user.key{
        withdraw_proposal=Proposal{reciever,amount, approvals:vec![true,false,false,false,false],executed:false};
    }else if multisig_pda_data.owner2==*user.key {
        withdraw_proposal=Proposal{reciever,amount, approvals:vec![false,true,false,false,false],executed:false};
    }else if multisig_pda_data.owner3==*user.key {
        withdraw_proposal=Proposal{reciever,amount, approvals:vec![false,false,true,false,false],executed:false};
    }else if multisig_pda_data.owner4==*user.key {
        withdraw_proposal=Proposal{reciever,amount, approvals:vec![false,false,false,true,false],executed:false};
    }else if multisig_pda_data.owner5==*user.key {
        withdraw_proposal=Proposal{reciever,amount, approvals:vec![false,false,false,false,true],executed:false};
    }else{
        return Err(ProgramError::IllegalOwner);
    }
    msg!("withdraw proposal : {:?}",withdraw_proposal);
    multisig_pda_data.proposals.push(withdraw_proposal);
    msg!("multisig data : {:?}",multisig_pda_data);

    multisig_pda_data.serialize(&mut *multisig_pda.data.borrow_mut())?;
    Ok(())
}

pub fn approve_withdraw_proposal(program_id:&Pubkey,accounts:&[AccountInfo],proposal_index:u8)->ProgramResult{
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
    
    let seeds=&["multisig".as_bytes()];
    let (multisig_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
    if multisig_derived_pda!=*multisig_pda.key{
        return Err(ProgramError::InvalidAccountOwner);
    }
    
    let mut multisig_pda_data=Multisig::try_from_slice(&multisig_pda.data.borrow())?;
    let idx=proposal_index as usize;
    msg!("z1 {}",multisig_pda_data.proposals[idx].executed);
    if multisig_pda_data.owner1==*user.key{
        multisig_pda_data.proposals[idx].approvals[0]=true;
    }else if multisig_pda_data.owner2==*user.key{
        multisig_pda_data.proposals[idx].approvals[1]=true;
    }else if multisig_pda_data.owner3==*user.key{
        multisig_pda_data.proposals[idx].approvals[2]=true;
    }else if multisig_pda_data.owner4==*user.key{
        multisig_pda_data.proposals[idx].approvals[3]=true;
    }else if multisig_pda_data.owner5==*user.key{
        multisig_pda_data.proposals[idx].approvals[4]=true;
    }
    multisig_pda_data.serialize(&mut *multisig_pda.data.borrow_mut())?;
    Ok(())
}

pub fn claim_withdraw_proposal(program_id:&Pubkey,accounts:&[AccountInfo],proposal_index:u8)->ProgramResult{
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
    
    let seeds=&["multisig".as_bytes()];
    let (multisig_derived_pda,bump)=Pubkey::find_program_address(seeds, program_id);
    if multisig_derived_pda!=*multisig_pda.key{
        return Err(ProgramError::InvalidAccountOwner);
    }
    
    let mut multisig_pda_data=Multisig::try_from_slice(&multisig_pda.data.borrow())?;
    let idx=proposal_index as usize;

    if multisig_pda_data.proposals[idx].reciever!=*user.key{
        return Err(ProgramError::InvalidAccountOwner);
    }

    let mut approvals_count:u8=0;
    for i in multisig_pda_data.proposals[idx].approvals.iter(){
        if *i==true{
            approvals_count+=1;
        }
    }

    if approvals_count>=multisig_pda_data.threshold && !multisig_pda_data.proposals[idx].executed{
        //do transfer , fails from pda to user if pda has no data  as pda not owned by stem program
        let vault_seeds=&["vault".as_bytes()];
        let (vault_derived_pda,bump)=Pubkey::find_program_address(vault_seeds, program_id);
        msg!("z3");
        let vault_seeds_with_bump=&["vault".as_bytes(),&[bump]];
        if vault_derived_pda!=*vault_pda.key{
            return Err(ProgramError::InvalidAccountOwner);
        }
        **vault_pda.try_borrow_mut_lamports()?-=multisig_pda_data.proposals[idx].amount;
        **user.try_borrow_mut_lamports()?+=multisig_pda_data.proposals[idx].amount;

        // let transfer_ix=transfer(&vault_derived_pda,
        //     &multisig_pda_data.proposals[idx].reciever,
        //     multisig_pda_data.proposals[idx].amount );
        // invoke_signed(&transfer_ix,
        //     &[vault_pda.clone(),user.clone(),system_prog.clone()],
        //     &[vault_seeds_with_bump])?;
        
        multisig_pda_data.proposals[idx].executed=true;
        multisig_pda_data.serialize(&mut *multisig_pda.data.borrow_mut())?;
    }
    msg!("z1 {}",multisig_pda_data.proposals[idx].executed);
    Ok(())
}







//Fixes/Optimisation possible in above contract:
// 1) PDA seeds are globally shared
// Right now you use only "multisig" / "vault" for seeds, which means one multisig and one vault for the 
// whole program. That’s almost never what you want.
// Fix: include a unique seed (creator, name, or a user-supplied 32-byte id):

// 2.) Missing owner checks
// Before reading/writing, assert the account owner is your program:
// if multisig_pda.owner != program_id {
//     return Err(ProgramError::IncorrectProgramId);
// }
// if vault_pda.owner != program_id {
//     return Err(ProgramError::IncorrectProgramId);
// }
// This blocks malicious accounts with the right pubkey but the wrong owner.

// 3) One-time init guard
// Prevent double init:
// if !multisig_pda.data_is_empty() {
//     return Err(ProgramError::AccountAlreadyInitialized);
// }


// 4.6) Safe lamport moves on claim
// You already noticed a system transfer from a program-owned source will fail. Manually moving lamports
//  is fine, but check balance first and use checked math:
// let amt = multisig_pda_data.proposals[idx].amount;
// if **vault_pda.lamports.borrow() < amt {
//     return Err(ProgramError::InsufficientFunds);
// }
// **vault_pda.try_borrow_mut_lamports()? = vault_pda
//     .lamports()
//     .checked_sub(amt).ok_or(ProgramError::InsufficientFunds)?;


// 5.B. One Proposal = one PDA
// Store proposals as separate PDA accounts (proposal_{index}), and keep only a small index list in the 
// multisig. This avoids reallocations entirely and is the most scalable.






// 🧱 What to build next (incremental difficulty)
// 1. Split proposals into PDA accounts (scalable multisig)
// Multisig PDA stores owners/threshold + proposal_count.
// Each Proposal = PDA at seed [b"proposal", multisig_pda, index_be_bytes].
// Add approve/execute flows across multiple PDAs.

// 2. Timelocked multisig
// Add eta on proposals; enforce Clock::get()?.unix_timestamp >= eta.
// Optional: cancel window.