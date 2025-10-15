use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, msg, program::{invoke, invoke_signed}, program_error::ProgramError, pubkey::Pubkey
};
use spl_associated_token_account::instruction::create_associated_token_account;
use spl_token::instruction::transfer;

use crate::state::Escrow;
use crate::error::EscrowError;

pub fn accept_escrow_offer(program_id:&Pubkey, accounts:&[AccountInfo],escrow_id:u64)->ProgramResult{
    let mut account_iter=accounts.iter();
    let taker=next_account_info(&mut account_iter)?;
    let escrow_pda=next_account_info(&mut account_iter)?;
    let mint_y=next_account_info(&mut account_iter)?;

    let escrow_pda_ata_x=next_account_info(&mut account_iter)?;
    let escrow_pda_ata_y=next_account_info(&mut account_iter)?;
    let initialiser_ata_x=next_account_info(&mut account_iter)?;
    let initialiser_ata_y=next_account_info(&mut account_iter)?;

    let taker_ata_x=next_account_info(&mut account_iter)?;
    let taker_ata_y=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;

    if !taker.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    let escrow_id_bytes=escrow_id.to_le_bytes();
    let escrow_seeds=&[b"escrow",escrow_id_bytes.as_ref()];
    let (escrow_derived_pda,bump)=Pubkey::find_program_address(escrow_seeds,program_id);
    let escrow_seeds_with_bump=&[b"escrow",escrow_id_bytes.as_ref(),&[bump]];

    if escrow_derived_pda!=*escrow_pda.key{
        return Err(EscrowError::VaultPdaMismatch.into());
    }
    let mut escrow=Escrow::try_from_slice(&escrow_pda.data.borrow())?;
    escrow.taker=*taker.key;
    escrow.taker_ata_x=*taker_ata_x.key;
    escrow.taker_ata_y=*taker_ata_y.key;

    let escrow_pda_ata_y_create_ix=create_associated_token_account(taker.key,
        &escrow_derived_pda, mint_y.key, &spl_token::ID);
    invoke(&escrow_pda_ata_y_create_ix, 
        &[taker.clone(),escrow_pda_ata_y.clone(),escrow_pda.clone(),
        mint_y.clone(),system_prog.clone(), token_prog.clone()])?;
        // mint_y.clone(),system_prog.clone(), token_prog.clone(),ata_prog.clone()])?;
    //is ata prog neccesary above like is it need to enntion prog whoch we are calling as accounts also
    msg!("escrow pda ata y account created!!");

    let taker_y_transfer_escrow_ata_y_ix=transfer(&spl_token::ID,
        taker_ata_y.key, escrow_pda_ata_y.key,
        taker.key, &[taker.key], escrow.amount_y)?;
    invoke(&taker_y_transfer_escrow_ata_y_ix, 
        &[taker_ata_y.clone(),escrow_pda_ata_y.clone(),
        taker.clone(),taker.clone()])?;
    msg!("transfer from taker ata y to escrow pda ata y done!!");




    //now we have to exchange escrow pda atax to taker ata x and
    //escrow pda ata y tokens to initialiser ata y
    let escrow_pda_ata_y_transfer_initialiser_ata_y=transfer(&spl_token::ID,
        escrow_pda_ata_y.key, initialiser_ata_y.key,
        escrow_pda.key, &[escrow_pda.key], escrow.amount_y)?;
        // escrow_pda.key, &[taker.key], escrow.amount_y)?;
    invoke_signed(&escrow_pda_ata_y_transfer_initialiser_ata_y,
        &[escrow_pda_ata_y.clone(),initialiser_ata_y.clone(),
        escrow_pda.clone(),escrow_pda.clone(),token_prog.clone()],
        &[escrow_seeds_with_bump]
    )?;
    // invoke(&escrow_pda_ata_y_transfer_initialiser_ata_y,
    //     &[escrow_pda_ata_y.clone(),initialiser_ata_y.clone(),
    //     escrow_pda.clone(),escrow_pda.clone(),token_prog.clone()])?;
        // escrow_pda.clone(),taker.clone(),token_prog.clone()])?;   signer will be escrow_pda or taker, i mean signer as who will pay 

    escrow.serialize(&mut *escrow_pda.data.borrow_mut())?;
    msg!("escrow pda data updated!!");
    Ok(())
}