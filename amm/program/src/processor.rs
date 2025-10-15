use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,msg
};
use borsh::{BorshDeserialize};
use crate::instruction::InstructionType;
use crate::instructions::{
    create_pool::create_pool,
    add_liquidity::add_liquidity,
    remove_liquidity::remove_liquidity
};

pub fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
)->ProgramResult{
    let instruction=InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    match instruction{
        InstructionType::CreatePool {  fee_bps,poolBump}=>{
            msg!("create LP pool ix called");
            create_pool(program_id, accounts,  fee_bps, poolBump)?;
        },
        InstructionType::AddLiquidity { depAmountA, depAmountB, poolBump }=>{
            msg!("add liquidity ix called");
            add_liquidity(program_id, accounts, depAmountA, depAmountB, poolBump)?;
        },
        InstructionType::RemoveLiquidity { lp_amount_burn, poolBump }=>{
            msg!("remove liquity ix called");
            remove_liquidity(program_id, accounts, lp_amount_burn, poolBump)?;
        }
    }
    Ok(())
}