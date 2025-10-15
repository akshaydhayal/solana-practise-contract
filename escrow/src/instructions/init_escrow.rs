use borsh::BorshSerialize;
use solana_program::{
    pubkey::Pubkey, msg,
    account_info::{AccountInfo,next_account_info},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    program::{invoke_signed,invoke} , 
    system_instruction::{create_account},
    rent::Rent, sysvar::Sysvar
};
use crate::error::EscrowError;
use crate::state::{ Escrow , EscrowState};
use spl_token::instruction::transfer;
use spl_associated_token_account::instruction::{
    create_associated_token_account
};
use spl_associated_token_account::get_associated_token_address;

pub fn init_escrow(program_id:&Pubkey, 
    accounts:&[AccountInfo], amount_x:u64, amount_y:u64 , escrow_id:u64)->ProgramResult{
    let mut account_iter=accounts.iter();
    // let user=next_account_info(&mut account_iter)?;
    let initialiser=next_account_info(&mut account_iter)?;
    let escrow_pda=next_account_info(&mut account_iter)?;
    let mint_x=next_account_info(&mut account_iter)?;
    let initialiser_ata_x=next_account_info(&mut account_iter)?;
    let initialiser_ata_y=next_account_info(&mut account_iter)?;
    let escrow_pda_ata_x=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;

    if !initialiser.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }

    // let escrow_seeds=&[b"escrow",initialiser.key.as_ref()];
    let escrow_id_bytes=escrow_id.to_le_bytes();
    let escrow_seeds=&[b"escrow",escrow_id_bytes.as_ref()];
    let (escrow_derived_pda,bump)=Pubkey::find_program_address(escrow_seeds,program_id);
    // let escrow_seeds_with_bump=&[b"escrow",initialiser.key.as_ref(),&[bump]];
    let escrow_seeds_with_bump=&[b"escrow", escrow_id_bytes.as_ref(), &[bump]];
    if escrow_derived_pda!=*escrow_pda.key{
        return Err(EscrowError::VaultPdaMismatch.into());
        // return Err(EscrowError::VaultPdaMismatch);  //this gived error, why?
    }
    if !escrow_pda.data_is_empty(){
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    let rent=Rent::get()?;
    let escrow_pda_size:usize=7*32 + 8*2 +1 + 8;
    let escrow_rent_exempt_bal=rent.minimum_balance(escrow_pda_size);
    let escrow_pda_create_ix=create_account(initialiser.key,
        escrow_pda.key, escrow_rent_exempt_bal,
        escrow_pda_size as u64, program_id);
    invoke_signed(&escrow_pda_create_ix,
        &[initialiser.clone(), escrow_pda.clone(),system_prog.clone()],  //is syetm prog needed
        &[escrow_seeds_with_bump])?;
    msg!("escrow pda account created");

    let escrow_pda_ata_x_ix=create_associated_token_account(initialiser.key,
        escrow_pda.key, mint_x.key, &spl_token::ID);
    invoke(&escrow_pda_ata_x_ix,
        &[initialiser.clone(),escrow_pda_ata_x.clone(),escrow_pda.clone(),
        mint_x.clone(),system_prog.clone(),token_prog.clone(),ata_prog.clone()])?;
    msg!("escrow pda ata_x created");

    // let escrow_pda_ata_x=get_associated_token_address(escrow_pda.key, mint_x.key);

    let initialiser_x_transfer_to_pda_x_ix=transfer(&spl_token::ID,
        initialiser_ata_x.key, escrow_pda_ata_x.key,
        initialiser.key, &[initialiser.key], amount_x)?;
    invoke(&initialiser_x_transfer_to_pda_x_ix, 
        &[initialiser_ata_x.clone(),escrow_pda_ata_x.clone(),
        // escrow_pda.clone(),initialiser.clone()])?;
        initialiser.clone(),initialiser.clone()])?;
    msg!("transfer from initialiser ata_x to escrow pda ata_x done");
    
    let escrow=Escrow{
        owner:*escrow_pda.key,
        initialiser:*initialiser.key,
        initialiser_ata_x:*initialiser_ata_x.key,
        initialiser_ata_y:*initialiser_ata_y.key,
        amount_x,
        amount_y,
        taker:Pubkey::default(),
        taker_ata_x:Pubkey::default(),
        taker_ata_y:Pubkey::default(),
        // is_pending:true,
        state:EscrowState::PENDING,
        expiry_time:99
    };
    escrow.serialize(&mut *escrow_pda.data.borrow_mut())?;
    Ok(())
}