use axum::{routing::post, Router};
use soroban_sdk::Client;

pub fn router() -> Router {
    Router::new().route("/issue", post(issue_credential))
}

async fn issue_credential() {
    // Connect to Soroban testnet and call CredentialContract::issue()
}
