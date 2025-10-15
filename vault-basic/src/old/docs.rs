// fn transfer(from_pubkey: &Pubkey, to_pubkey: &Pubkey, lamports: u64) -> Instruction
// Transfer lamports from an account owned by the system program.

// This function produces an [Instruction] which must be submitted in a Transaction or invoked to take effect, containing a serialized [SystemInstruction::Transfer].

// Required signers
// The from_pubkey signer must sign the transaction.

// Examples
// These examples allocate space for an account, transfer it the minimum balance for rent exemption, and assign the account to a program.

// Example: client-side RPC
// This example submits the instructions from an RPC client. It assigns the account to a provided program account. The payer and new_account are signers.

use solana_rpc_client::rpc_client::RpcClient;
use solana_pubkey::Pubkey;
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use solana_system_interface::instruction;
use anyhow::Result;

fn create_account(
    client: &RpcClient,
    payer: &Keypair,
    new_account: &Keypair,
    owning_program: &Pubkey,
    space: u64,
) -> Result<()> {
    let rent = client.get_minimum_balance_for_rent_exemption(space.try_into()?)?;

    let transfer_instr = instruction::transfer(
        &payer.pubkey(),
        &new_account.pubkey(),
        rent,
    );

    let allocate_instr = instruction::allocate(
        &new_account.pubkey(),
        space,
    );

    let assign_instr = instruction::assign(
        &new_account.pubkey(),
        owning_program,
    );

    let blockhash = client.get_latest_blockhash()?;
    let tx = Transaction::new_signed_with_payer(
        &[transfer_instr, allocate_instr, assign_instr],
        Some(&payer.pubkey()),
        &[payer, new_account],
        blockhash,
    );

    let _sig = client.send_and_confirm_transaction(&tx)?;

    Ok(())
}