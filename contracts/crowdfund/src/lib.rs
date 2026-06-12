#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};
use soroban_sdk::token;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Campaign,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub creator: Address,
    pub goal: i128,
    pub total_raised: i128,
    pub active: bool,
}

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    /// Initialize the campaign with a goal.
    pub fn create_campaign(env: Env, creator: Address, goal: i128) {
        creator.require_auth();

        if env.storage().instance().has(&DataKey::Campaign) {
            panic!("Campaign already initialized");
        }

        let campaign = Campaign {
            creator,
            goal,
            total_raised: 0,
            active: true,
        };

        env.storage().instance().set(&DataKey::Campaign, &campaign);
    }

    /// Donate to the campaign.
    pub fn donate(env: Env, donor: Address, token: Address, amount: i128) {
        donor.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign)
            .expect("Campaign not found");
        
        if !campaign.active {
            panic!("Campaign is not active");
        }

        // Transfer tokens from donor to contract
        let client = token::Client::new(&env, &token);
        client.transfer(&donor, &env.current_contract_address(), &amount);

        // Update campaign state
        campaign.total_raised += amount;
        env.storage().instance().set(&DataKey::Campaign, &campaign);

        // Emit donation event
        let topics = (symbol_short!("donate"), donor);
        env.events().publish(topics, amount);
    }

    /// Get current campaign data.
    pub fn get_campaign(env: Env) -> Campaign {
        env.storage().instance().get(&DataKey::Campaign).expect("Campaign not found")
    }
}

mod test;
