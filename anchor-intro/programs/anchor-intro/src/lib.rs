use anchor_lang::prelude::*;

declare_id!("CUkzBSEdfAxfCLH1kAXLdjWhtcWRyf89ExsukP3VSgCZ");

#[program]
pub mod anchor_intro{
    use super::*;

    pub fn init_intro(ctx:Context<InitIntro>,name:String, bio:String)->Result<()>{
        ctx.accounts.intro_acc.set_inner(
            Intro { name, bio }
        );
        Ok(())
    }
    pub fn update_intro(ctx:Context<UpdateIntro>,new_bio:String)->Result<()>{
        ctx.accounts.intro_account.bio=new_bio;
        Ok(())
    }
    pub fn delete_bio(_ctx:Context<DeleteBio>)->Result<()>{
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitIntro<'info>{
    #[account(mut)]
    pub user:Signer<'info>,
    #[account(
        init_if_needed, payer=user, space=8+Intro::INIT_SPACE,
        seeds=[b"intro",user.key.as_ref()], bump
    )]
    pub intro_acc:Account<'info,Intro>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct UpdateIntro<'info>{
    // #[account(mut)]   //user no need to be mut, just mut when lamports change or data change
    pub user:Signer<'info>,
    #[account(mut, seeds=[b"intro", user.key().as_ref()], bump)]  //try realloc leter this
    pub intro_account:Account<'info,Intro>
}

#[derive(Accounts)]
pub struct DeleteBio<'info>{
    // #[account(mut)]    //so mut not required here, mut only when debit and not in cerdit lamports
    pub user:Signer<'info>,
    #[account(
        mut, close=user,
    )]
    pub intro_acc:Account<'info, Intro>
}
#[account]
#[derive(InitSpace)]
pub struct Intro{
    #[max_len(20)]
    pub name:String,
    #[max_len(50)]
    pub bio:String
}