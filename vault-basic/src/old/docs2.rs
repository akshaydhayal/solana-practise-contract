// Example: on-chain program
// This example submits the instructions from an on-chain Solana program. The created account is a program derived address, funded by payer, and assigned to the running program. The payer and new_account_pda are signers, with new_account_pda being signed for virtually by the program itself via invoke_signed, payer being signed for by the client that submitted the transaction.

use solana_account_info::{next_account_info, AccountInfo};
use solana_cpi::invoke_signed;
use solana_program::sysvar::{rent::Rent, Sysvar};
use solana_program_entrypoint::entrypoint;
use solana_program_error::ProgramResult;
use solana_pubkey::Pubkey;
use solana_system_interface::{instruction, program};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CreateAccountInstruction {
    /// The PDA seed used to distinguish the new account from other PDAs
    pub new_account_seed: [u8; 16],
    /// The PDA bump seed
    pub new_account_bump_seed: u8,
    /// The amount of space to allocate for `new_account_pda`
    pub space: u64,
}

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instr = CreateAccountInstruction::deserialize(&mut &instruction_data[..])?;

    let account_info_iter = &mut accounts.iter();

    let payer = next_account_info(account_info_iter)?;
    let new_account_pda = next_account_info(account_info_iter)?;
    let system_account = next_account_info(account_info_iter)?;

    assert!(payer.is_signer);
    assert!(payer.is_writable);
    // Note that `new_account_pda` is not a signer yet.
    // This program will sign for it via `invoke_signed`.
    assert!(!new_account_pda.is_signer);
    assert!(new_account_pda.is_writable);
    assert!(program::check_id(system_account.key));

    let new_account_seed = &instr.new_account_seed;
    let new_account_bump_seed = instr.new_account_bump_seed;

    let rent = Rent::get()?
        .minimum_balance(instr.space.try_into().expect("overflow"));

    invoke_signed(
        &instruction::create_account(
            payer.key,
            new_account_pda.key,
            rent,
            instr.space,
            &program::ID
        ),
        &[payer.clone(), new_account_pda.clone()],
        &[&[
            payer.key.as_ref(),
            new_account_seed,
            &[new_account_bump_seed],
        ]],
    )?;

    Ok(())
}