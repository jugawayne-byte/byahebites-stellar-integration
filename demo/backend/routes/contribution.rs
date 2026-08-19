use axum::{routing::post, Router};
use soroban_sdk::Client;

pub fn router() -> Router {
    Router::new().route("/record", post(record_contribution))
}

async fn record_contribution() {
    // Connect to Soroban testnet and call ContributionContract::record()
}
