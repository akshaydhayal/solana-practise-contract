use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, 
    program::invoke, program_error::ProgramError, pubkey::Pubkey,sysvar,msg,
    account_info::debug_account_data
};
use mpl_token_metadata::instructions::{
    CreateMetadataAccountV3,CreateMetadataAccountV3Builder, 
    CreateMetadataAccountV3Cpi ,CreateMetadataAccountV3CpiBuilder, CreateMetadataAccountV3CpiAccounts,
    CreateMetadataAccountV3InstructionArgs,
};
use mpl_token_metadata::types::DataV2;
use mpl_token_metadata::accounts::Metadata;   

pub fn create_mint_metadata(program_id:&Pubkey, accounts:&[AccountInfo])->ProgramResult{
    let mut  account_iter=accounts.iter();
    let user=next_account_info(&mut account_iter)?;
    let mint=next_account_info(&mut account_iter)?;
    let mint_metadata=next_account_info(&mut account_iter)?;
    let mint_ata=next_account_info(&mut account_iter)?;
    let mint_ata2=next_account_info(&mut account_iter)?;
    let token_prog=next_account_info(&mut account_iter)?;
    let system_prog=next_account_info(&mut account_iter)?;
    let rent_sysvar=next_account_info(&mut account_iter)?;
    let ata_prog=next_account_info(&mut account_iter)?;
    let mpl_metadata_prog=next_account_info(&mut account_iter)?;

    if !user.is_signer{
        return Err(ProgramError::MissingRequiredSignature);
    }
    if *token_prog.key!=spl_token::id() && *system_prog.key!=solana_program::system_program::id() && *ata_prog.key!=spl_associated_token_account::id(){
        return Err(ProgramError::IncorrectProgramId);
    }


    // mpl_token_metadata::instructions::metadata

    let create_metadata_acc=CreateMetadataAccountV3{
        metadata:*mint_metadata.key,
        mint:*mint.key,
        mint_authority:*user.key,
        payer:*user.key,
        update_authority:(*user.key,true),
        rent:Some(solana_program::sysvar::rent::id()),
        system_program:*system_prog.key
    };
    msg!("a");
    let data_v2=DataV2{
        name:"A".to_string(),
        symbol:String::from("A"),
        uri:String::from("h"),
        collection:None,
        seller_fee_basis_points:0,
        creators:None,
        uses:None
    };
    // msg!("data v2 : {:?}",data_v2);
    let ix2=CreateMetadataAccountV3Builder::new()
    .metadata(*mint_metadata.key)
    .mint(*mint.key)
    .mint_authority(*user.key)
    .payer(*user.key)
    .update_authority(*user.key, true)
    .system_program(*system_prog.key)
    .rent(Some(sysvar::rent::ID))
    .data(data_v2)
    .is_mutable(true)
    .instruction();

    // msg!("ix2 : {:?}",ix2);

    // let ix=create_metadata_acc.instruction(CreateMetadataAccountV3InstructionArgs{
    //     data:data_v2,
    //     is_mutable:true,
    //     collection_details:None
    // });

    invoke(&ix2,
        &[mint_metadata.clone(),mint.clone(),user.clone(),user.clone(),
            // user.clone(),system_prog.clone(),rent_sysvar.clone(),mpl_metadata_prog.clone()])?;
            user.clone(),system_prog.clone(),rent_sysvar.clone()])?;
    Ok(())
}