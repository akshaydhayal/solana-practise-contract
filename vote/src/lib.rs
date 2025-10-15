use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh1::try_from_slice_unchecked,
    entrypoint,entrypoint::{ProgramResult}, msg, program::{invoke,invoke_signed},
    program_error::ProgramError, pubkey::Pubkey, rent::Rent,
    system_instruction::create_account, sysvar::Sysvar
};
use spl_token::{instruction::set_authority, instruction::};


entrypoint!(process_instruction);

#[derive(BorshSerialize,BorshDeserialize)]
enum InstructionType{
    PollInit{poll_id:u32,title:String,options:Vec<String>,votes:Vec<u32>},
    // Vote{poll_id:u32,option_id:u32,voter:Pubkey}
    Vote{poll_id:u32,option_id:u32}
}

#[derive(BorshSerialize,BorshDeserialize)]
struct Poll{
    poll_id:u32,
    title:String,
    options:Vec<String>,
    votes:Vec<u32>,
    voters:Vec<Pubkey>
}
pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    // set_authority(token_program_id, owned_pubkey, new_authority_pubkey, authority_type, owner_pubkey, signer_pubkeys)
    let mut account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let poll_pda=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    
    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *system_prog.key!=solana_program::system_program::ID{
        return Err(ProgramError::IncorrectProgramId);
    }
    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction{
        InstructionType::PollInit { poll_id, title, options ,votes}=>{
            if !poll_pda.data_is_empty(){
                return Err(ProgramError::AccountAlreadyInitialized);
            }
            let poll_id_bytes=poll_id.to_le_bytes();
            let seeds=&[b"poll",poll_id_bytes.as_ref()];   //error when used user as seed for it as that becomes unique to user
            let (expected_pda,bump)=Pubkey::find_program_address(seeds,program_id);
            msg!("expected pda in contract : {}",expected_pda);
            let seeds_with_bump=&[b"poll", poll_id_bytes.as_ref(),&[bump]];
            if expected_pda!=*poll_pda.key{
                return Err(ProgramError::InvalidSeeds);
            }
            // let poll_pda_space:usize=300;
            //use a other pda to store voters list
            let poll_pda_space:usize=4 + 
                                     4 + title.len() +
                                     4 + options.iter().map(|o| 4+o.len()).sum::<usize>() +
                                     4 + votes.len()*4 +
                                     4 + 32*10 ;
            // let poll_size1=poll_pda.data_len();    //will not work before account creation
            let rent=Rent::get()?;
            let poll_pda_rent_exemption_bal=rent.minimum_balance(poll_pda_space);
            
            let create_account_ix=create_account(user.key, poll_pda.key,
                poll_pda_rent_exemption_bal, poll_pda_space as u64, program_id);
            invoke_signed(&create_account_ix,
                &[user.clone(),poll_pda.clone(),system_prog.clone()],
                &[seeds_with_bump])?;
            msg!("poll pda account created!!");
            
            let poll_data=Poll{poll_id,title,options,votes,voters:Vec::new()};
            poll_data.serialize(&mut *poll_pda.data.borrow_mut())?;
        },

        // InstructionType::Vote { poll_id, option_id ,voter}=>{
        InstructionType::Vote { poll_id, option_id }=>{
            if poll_pda.owner!=program_id{
                return Err(ProgramError::IncorrectAuthority);
            }
            let poll_id_bytes=poll_id.to_le_bytes();
            let seeds=&[b"poll", poll_id_bytes.as_ref()];
            let (expected_pda,bump)=Pubkey::find_program_address(seeds, program_id);
            if expected_pda!=*poll_pda.key{
                return Err(ProgramError::InvalidSeeds);
            }
            // let mut poll_pda_data=Poll::try_from_slice(&poll_pda.data.borrow())?;
            // let mut data_ref = poll_pda.data.borrow();
            // let mut poll_pda_data: Poll = Poll::try_from_slice(&data_ref[..])?;
            let mut poll_pda_data:Poll=try_from_slice_unchecked(&poll_pda.data.borrow())?;
            let mut voter_has_voted=false;
            for item in poll_pda_data.voters.iter(){
                // if *item==voter{
                if item==user.key{
                    voter_has_voted=true;
                    break;
                }
            }
            if !voter_has_voted{
                poll_pda_data.votes[option_id as usize]+=1;
                // poll_pda_data.voters.push(voter);
                poll_pda_data.voters.push(*user.key);
            }else {
                return Err(ProgramError::InvalidArgument);
            }
            poll_pda_data.serialize(&mut *poll_pda.data.borrow_mut())?;
        }
    
    }
    Ok(())
}