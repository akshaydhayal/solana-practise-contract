use borsh::{BorshSerialize,BorshDeserialize};
use solana_program::{
    pubkey::Pubkey, account_info::AccountInfo,
    entrypoint::ProgramResult, program_error::ProgramError,msg
};

use crate::instruction::InstructionType;
use crate::instructions::{
    init_mint::init_mint,
    create_mint_ata::create_mint_ata,
    mint_to_ata::mint_to_ata,
    transfer_to_ata::transfer_to_ata,
    burn_tokens::burn_tokens,
    freeze_ata::freeze_ata,
    unfreeze_ata::unfreeze_ata,
    set_ata_authority::set_ata_authority,
    set_mint_authority::set_mint_authority,
    create_mint_metadata::create_mint_metadata
};

pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{ 
    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    msg!("ix data : {:?}",instruction_data);
    match instruction{
        InstructionType::InitMint{decimals}=>{
            msg!("init mint tx called");
            init_mint(program_id,accounts,decimals)?;
        },
        InstructionType::CreateMintATA=>{
            msg!("create mint ata ix called");
            create_mint_ata(program_id,accounts)?;
        },
        InstructionType::MintTo{mint_amount}=>{
            msg!("mintto ix called");
            mint_to_ata(program_id,accounts,mint_amount)?;
        },
        InstructionType::TransferToAta { amount }=>{
            msg!("transfer to ata ix called");
            transfer_to_ata(program_id, accounts, amount)?;
        },
        InstructionType::BurnTokens { amount }=>{
            msg!("burn tokens ix called");
            burn_tokens(program_id, accounts, amount)?;
        },
        InstructionType::FreezeATA=>{
            msg!("freeze ata ix called");
            freeze_ata(program_id, accounts)?;
        },
        InstructionType::UnfreezeATA=>{
            msg!("unfreeze ata ix called!");
            unfreeze_ata(program_id, accounts)?;
        },
        InstructionType::SetAuthority=>{
            msg!("set authority ix called");
            set_ata_authority(program_id, accounts)?;
        },
        InstructionType::SetMintAuthority=>{
            msg!("set mint authority ix called");
            set_mint_authority(program_id, accounts)?;
        },
        InstructionType::CreateMintMetadata=>{
            msg!("create mint metadata ix called");
            create_mint_metadata(program_id, accounts)?;
        }
    }
    Ok(())
}