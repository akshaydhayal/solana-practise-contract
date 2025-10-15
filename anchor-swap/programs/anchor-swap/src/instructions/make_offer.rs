use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{TokenAccount,Mint,TokenInterface},
    associated_token::AssociatedToken,
    // token::spl_token::instruction::transfer,
    // token_2022::spl_token_2022::instruction::transfer_checked,
    token_interface::{TransferChecked,transfer_checked}
};
use crate::offer::Offer;

//why offer accounts are init and not init_if_needed
#[derive(Accounts)]
#[instruction(id:u64)]
pub struct MakeOffer<'info>{
    #[account(mut)]
    pub maker:Signer<'info>,

    #[account(init, payer=maker, space=8+Offer::INIT_SPACE, 
        seeds=[b"offer",maker.key().as_ref(),id.to_le_bytes().as_ref()], bump)]
    pub offer:Account<'info,Offer>,

    #[account(mint::token_program=token_program)]
    pub token_mint_a:InterfaceAccount<'info,Mint>,

    #[account(mint::token_program=token_program)]
    pub token_mint_b:InterfaceAccount<'info,Mint>,

    #[account(mut, associated_token::mint=token_mint_a, associated_token::authority=maker,
        associated_token::token_program=token_program)]
    pub maker_token_account_a:InterfaceAccount<'info,TokenAccount>,

    #[account(init, payer=maker, associated_token::mint=token_mint_a,
        // associated_token::authority=maker, associated_token::token_program=token_program)]
        associated_token::authority=offer, associated_token::token_program=token_program)]
    pub vault_account_a:InterfaceAccount<'info,TokenAccount>,

    pub system_program:Program<'info,System>,
    pub token_program:Interface<'info,TokenInterface>,
    pub associated_token_program:Program<'info,AssociatedToken>
}


pub fn send_offered_tokens_to_vault(ctx:&Context<MakeOffer>, token_a_offered_amount:u64)->Result<()>{
    msg!("acc : {:?} {:?}",ctx.accounts.maker_token_account_a,ctx.accounts.vault_account_a);
    let accounts=TransferChecked{
        from:ctx.accounts.maker_token_account_a.to_account_info(),
        mint:ctx.accounts.token_mint_a.to_account_info(),
        to:ctx.accounts.vault_account_a.to_account_info(),
        authority:ctx.accounts.maker.to_account_info()
    };
    let cpi_context=CpiContext::new(
        ctx.accounts.token_program.to_account_info(), accounts);
 
    transfer_checked(cpi_context, token_a_offered_amount, ctx.accounts.token_mint_a.decimals)?;
    Ok(())
}
pub fn save_offer(ctx:Context<MakeOffer>, id:u64, token_b_wanted_offer:u64)->Result<()>{
    let offer_account=&mut ctx.accounts.offer;
    offer_account.set_inner(
        Offer{
            id:id,
            token_b_wanted_amount:token_b_wanted_offer,
            maker:*ctx.accounts.maker.key,
            token_mint_a:ctx.accounts.token_mint_a.key(),
            token_mint_b:ctx.accounts.token_mint_b.key(),
            bump:ctx.bumps.offer
        }
    );
    Ok(())
}
