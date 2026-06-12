#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient;

#[test]
fn test_campaign_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, CrowdfundContract);
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let donor = Address::generate(&env);
    
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = TokenClient::new(&env, &token_contract);
    let token_admin_client = StellarAssetClient::new(&env, &token_contract);
    
    token_admin_client.mint(&donor, &1000);

    client.create_campaign(&creator, &500);

    let campaign = client.get_campaign();
    assert_eq!(campaign.goal, 500);
    assert_eq!(campaign.total_raised, 0);

    client.donate(&donor, &token_contract, &100);

    let campaign_after = client.get_campaign();
    assert_eq!(campaign_after.total_raised, 100);
    
    assert_eq!(token_client.balance(&contract_id), 100);
    assert_eq!(token_client.balance(&donor), 900);
}
