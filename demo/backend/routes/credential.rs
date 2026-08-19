use axum::{routing::post, Router, Json};
use soroban_sdk::{Client, Env};

pub fn router() -> Router {
    Router::new().route("/issue", post(issue_credential))
}

async fn issue_credential() -> Json<String> {
    let client = Client::new("https://soroban-testnet.stellar.org");

    let result = client
        .call("CredentialContract", "issue", (1234_u32,))
        .await;

    Json(format!("Issued MSME credential: {:?}", result))
}
