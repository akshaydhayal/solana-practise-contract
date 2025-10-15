use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface},
    associated_token::AssociatedToken,
    token_interface::{TransferChecked, transfer_checked}
};

use crate::offer::Offer;

#[derive(Accounts)]
#[instruction(id:u64)]
pub struct TakeOffer<'info>{
    #[account(mut)]
    pub taker:Signer<'info>,

    #[account(mut)]
    pub maker:SystemAccount<'info>,

    #[account(mint::token_program=token_program)]
    pub token_mint_a:InterfaceAccount<'info, Mint>,

    #[account(mint::token_program=token_program)]
    pub token_mint_b:InterfaceAccount<'info,Mint>,

    #[account(mut, associated_token::mint=token_mint_b, associated_token::authority=taker,
        associated_token::token_program=token_program)]
    pub taker_token_account_b:InterfaceAccount<'info, TokenAccount>,
    
    #[account(init_if_needed, payer=taker, associated_token::mint=token_mint_a,
        associated_token::authority=taker, associated_token::token_program=token_program)]
    pub taker_token_account_a:InterfaceAccount<'info, TokenAccount>,

    #[account(init_if_needed, payer=taker, associated_token::mint=token_mint_b, 
        associated_token::authority=maker, associated_token::token_program=token_program)]
    pub maker_token_account_b:InterfaceAccount<'info,TokenAccount>,

    #[account(mut, associated_token::mint=token_mint_a, associated_token::authority=offer,
        associated_token::token_program=token_program)]
    pub vault_token_account_a:InterfaceAccount<'info, TokenAccount>,

    #[account(mut, seeds=[b"offer",maker.key().as_ref(), id.to_le_bytes().as_ref()], bump)]
    pub offer:Account<'info, Offer>,

    pub system_program:Program<'info, System>,
    pub token_program:Interface<'info, TokenInterface>,
    pub associated_token_program:Program<'info, AssociatedToken>

}


pub fn send_wanted_tokens_to_maker(ctx:&Context<TakeOffer>)->Result<()>{
    let accounts=TransferChecked{
        from:ctx.accounts.taker_token_account_b.to_account_info(),
        to:ctx.accounts.maker_token_account_b.to_account_info(),
        mint:ctx.accounts.token_mint_b.to_account_info(),
        authority:ctx.accounts.taker.to_account_info()
    };
    let cpi_context=CpiContext::new(
        ctx.accounts.token_program.to_account_info(), accounts);
    transfer_checked(cpi_context, 
        ctx.accounts.offer.token_b_wanted_amount, 
        ctx.accounts.token_mint_b.decimals)?;
    Ok(())
}

pub fn withdraw_tokens_and_close_vault(ctx:Context<TakeOffer>)->Result<()>{
    // let maker_bytes=ctx.accounts.offer.maker.key();
    let maker_bytes=ctx.accounts.maker.key();
    let id_bytes=ctx.accounts.offer.id.to_le_bytes();
    let seeds=&[b"offer", maker_bytes.as_ref(), id_bytes.as_ref(), &[ctx.bumps.offer]];
   
    let accounts=TransferChecked{
        from:ctx.accounts.vault_token_account_a.to_account_info(),
        to: ctx.accounts.taker_token_account_a.to_account_info(),
        mint:ctx.accounts.token_mint_a.to_account_info(),
        authority:ctx.accounts.offer.to_account_info()
    };
    let seeds2 = [&seeds[..]];
    let seeds3 = &[seeds];

    let cpi_context=CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        accounts, 
        &seeds2
    );
    transfer_checked(cpi_context,
         ctx.accounts.vault_token_account_a.amount,
        ctx.accounts.token_mint_a.decimals)?;
    Ok(())
}

// // transfer funds from taker ata b to maker ata b
// // take funda from vault ata a to taker ata a
// // acc to make - maker aata b, taker ata a