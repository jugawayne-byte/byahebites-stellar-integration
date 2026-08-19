use axum::{routing::post, Router, Json};
use soroban_sdk::{Client, Env};

pub fn router() -> Router {
    Router::new().route("/record", post(record_contribution))
}

async fn record_contribution() -> Json<String> {
    let client = Client::new("https://soroban-testnet.stellar.org");

    let result = client
        .call("ContributionContract", "record", ("creator123",))
        .await;

    Json(format!("Recorded contribution: {:?}", result))
}
