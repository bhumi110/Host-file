#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: String) -> String {
        let mut string = String::from_str(&env, "Hello ");
        string.append(&to);
        string
    }
}
