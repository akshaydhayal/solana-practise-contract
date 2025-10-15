use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, token, token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked}
};
declare_id!("4iC229Bhe8AH7KYQqQTyiZX7fhY3buzX6upoS8Rfyk96");

#[program]
pub mod anchor_vesting{
    use super::*;

    pub fn initialize_vesting(ctx:Context<InitializeVesting>, company_name:String , total_vesting_tokens:u64)->Result<()>{
        //save vetsing data and transfer locked mint tokens to vesting vault
        ctx.accounts.vesting_account.set_inner(
            VestingAccount {
                employer:ctx.accounts.user.key(),
                company_name: company_name,
                mint: ctx.accounts.mint.key(),
                vesting_vault:ctx.accounts.vesting_vault.key(),
                vault_tokens_used:0,
                bump: ctx.bumps.vesting_account,
             }
        );

        let transfer_accounts=TransferChecked{
            from:ctx.accounts.user_mint_treasury_ata.to_account_info(),
            to:ctx.accounts.vesting_vault.to_account_info(),
            mint:ctx.accounts.mint.to_account_info(),
            authority:ctx.accounts.user.to_account_info()
        };
        let cpi_context=CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts
        );
        transfer_checked(cpi_context, total_vesting_tokens, ctx.accounts.mint.decimals)?;
        Ok(())
    }

    pub fn add_employee(ctx: Context<AddEmployee>, _company_name:String, employee_name:String, 
        employee_total_vested_tokens:u64, cliff_time:u64, unlock_interval_time:u64, unlock_interval_amount:u64 )->Result<()>
    {
        //check that we dont allocate tokens more than tokens present in vesting vault account 
        let used_tokens=ctx.accounts.vesting_account.vault_tokens_used;
        if used_tokens + employee_total_vested_tokens > ctx.accounts.vesting_vault.amount{
            return Err(ProgramError::InvalidArgument.into());
        }
        ctx.accounts.employee.set_inner(
            Employee{ 
                employee:ctx.accounts.user.key(),
                employer:ctx.accounts.vesting_account.employer,
                employee_name, 
                employee_total_vested_tokens, 
                cliff_time, 
                unlock_interval_time,
                unlock_interval_amount, 
                claimed_intervals_count:0,
                bump: ctx.bumps.employee,
        });
        ctx.accounts.vesting_account.vault_tokens_used+=employee_total_vested_tokens;
        Ok(())
    }


    pub fn claim_tokens(ctx:Context<ClaimTokens>, company_name:String, employee_name:String)->Result<()>{
        let clock=Clock::get()?;
        let current_time=clock.unix_timestamp;
        msg!("current time : {} {} {} {}",current_time,ctx.accounts.employee.cliff_time,ctx.accounts.employee.claimed_intervals_count,ctx.accounts.employee.unlock_interval_time);
        //   "Program log: current time : 1757973048 40 0 10",
        // total vest amount=200, cliff time =100, interval time=25, interval amount=50
        // time now= 99, notjing to claim
        // time now= 124, nothign to claim
        // time now= 125, 1 interval amount to claim
        // time now= 149, nothing to claim
        // time_passed_after_last_claim=now_time-(cliff_time+intervals_claimed*interval_time)
        //intervals to claim=time_passed_after_last_claim/interval_time

        //add check that employee should not take more than employeeTotalVestedTokens:
        
        let time_passed_after_last_claim=(current_time as u64) - (ctx.accounts.employee.cliff_time + ctx.accounts.employee.claimed_intervals_count * ctx.accounts.employee.unlock_interval_time);
        let intervals_to_claim=time_passed_after_last_claim / ctx.accounts.employee.unlock_interval_time;
        ctx.accounts.employee.claimed_intervals_count=intervals_to_claim;
        let amount_to_claim=intervals_to_claim*ctx.accounts.employee.unlock_interval_amount;
        msg!("amount_to_claim : {} {}",amount_to_claim, intervals_to_claim);

        let transfer_accounts=TransferChecked{
            from:ctx.accounts.vesting_vault.to_account_info(),
            to:ctx.accounts.employee_claim_ata.to_account_info(),
            mint:ctx.accounts.mint.to_account_info(),
            authority:ctx.accounts.vesting_account.to_account_info()
        };
        // let seeds=&[b"vesting",company_name.as_bytes(),&ctx.bumps.vesting_account.to_be_bytes()[..]];
        let employer=ctx.accounts.vesting_account.employer.key();
        let seeds=&[b"vesting",employer.as_ref(), &ctx.bumps.vesting_account.to_be_bytes()[..]];
        let seeds2=[&seeds[..]];
        let cpi_context=CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            &seeds2
        );
        transfer_checked(cpi_context, amount_to_claim, ctx.accounts.mint.decimals)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name:String)]
pub struct InitializeVesting<'info>{
    #[account(mut)]
    pub user:Signer<'info>,

    #[account(mint::token_program=token_program)]
    pub mint:InterfaceAccount<'info, Mint>,

    //should not use user.key as seed in pda erive as will be difficult for eployee to derive then
    #[account(init_if_needed, payer=user, space =8 + VestingAccount::INIT_SPACE,
        // seeds=[b"vesting", company_name.as_bytes()], bump)]
        seeds=[b"vesting", user.key.as_ref()], bump)]
    pub vesting_account:Account<'info, VestingAccount>,

    //this can be a pda token account so program can handle it
    #[account(init_if_needed, payer=user, associated_token::mint=mint, 
        associated_token::authority=vesting_account, associated_token::token_program=token_program)]
    pub vesting_vault:InterfaceAccount<'info, TokenAccount>,

    #[account(mut, associated_token::mint=mint, associated_token::authority=user, 
        associated_token::token_program=token_program)]
    pub user_mint_treasury_ata:InterfaceAccount<'info,TokenAccount>,

    pub system_program:Program<'info,System>,
    pub token_program:Interface<'info, TokenInterface>,
    pub associated_token_program:Program<'info, AssociatedToken>
}


#[derive(Accounts)]
#[instruction(company_name:String, employee_name:String)]
pub struct AddEmployee<'info>{
    #[account(mut)]
    pub user:Signer<'info>,

    #[account(init_if_needed, payer=user, space=8+Employee::INIT_SPACE, 
        // seeds=[b"employee", employee_name.as_bytes()],bump)]
        seeds=[b"employee", user.key.as_ref()],bump)]
    pub employee:Account<'info, Employee>,

    pub employer:SystemAccount<'info>,
    // #[account(mut, seeds=[b"vesting",company_name.as_bytes()],bump)]
    #[account(mut, seeds=[b"vesting",employer.key.as_ref()],bump)]
    pub vesting_account:Account<'info, VestingAccount>,

    #[account(associated_token::authority=vesting_account, associated_token::mint=mint,
        associated_token::token_program=token_program)]
    pub vesting_vault:InterfaceAccount<'info, TokenAccount>,

    #[account(mint::token_program=token_program)]
    pub mint:InterfaceAccount<'info, Mint>,

    pub system_program:Program<'info, System>,
    pub token_program:Interface<'info, TokenInterface>,
    pub associated_token_program:Program<'info, AssociatedToken>

}

#[derive(Accounts)]
#[instruction(company_name:String, employee_name:String)]
pub struct ClaimTokens<'info>{
    #[account(mut)]
    pub user:Signer<'info>,

    
    // #[account(mut, seeds=[b"employee", employee_name.as_bytes()], bump)]
    #[account(mut, seeds=[b"employee", user.key.as_ref()], bump)]
    pub employee:Account<'info, Employee>,

    // #[account(seeds=[b"vesting",company_name.as_bytes()],bump)]
    #[account(seeds=[b"vesting",employee.employer.key().as_ref()],bump)]
    pub vesting_account:Account<'info, VestingAccount>,

    #[account(mint::token_program=token_program)]
    pub mint:InterfaceAccount<'info, Mint>,

    #[account(init_if_needed, payer=user, associated_token::mint=mint, 
        associated_token::authority=user, associated_token::token_program=token_program)]
    pub employee_claim_ata:InterfaceAccount<'info, TokenAccount>,

    #[account(mut, associated_token::mint=mint, associated_token::authority=vesting_account,
        associated_token::token_program=token_program)]
    pub vesting_vault:InterfaceAccount<'info, TokenAccount>,

    pub system_program:Program<'info, System>,
    pub token_program:Interface<'info, TokenInterface>,
    pub associated_token_program:Program<'info, AssociatedToken>
}

#[account]
#[derive(InitSpace)]    //167 SIZE
pub struct VestingAccount{
    pub employer:Pubkey,
    #[max_len(50)]
    pub company_name:String,
    pub mint:Pubkey,
    pub vesting_vault:Pubkey,
    pub vault_tokens_used:u64,
    pub bump:u8
}

#[account]
#[derive(InitSpace)]  //157 SIZE
pub struct Employee{
    pub employee:Pubkey, 
    pub employer:Pubkey, 
    #[max_len(40)]
    pub employee_name:String,
    pub employee_total_vested_tokens:u64,
    pub cliff_time:u64,
    pub unlock_interval_time:u64,   //after cliff time, we will give unlock interval amount after every unlock interval time
    pub unlock_interval_amount:u64,
    pub claimed_intervals_count:u64,
    pub bump:u8
}





// #[program]
// pub mod anchor_vesting {
//     use super::*;

//     pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
//         msg!("Greetings from: {:?}", ctx.program_id);
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize {}
