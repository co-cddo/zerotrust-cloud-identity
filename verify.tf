resource "ibmverify_oauth2_client" "verify_oidc_client" {
  client_name                            = var.client_name
  redirect_uris                          = [ var.redirect_uris ]
  registration_client_uri                = ""
  access_policy                          = "default"
  all_users_entitled                     = true
  authorization_encrypted_response_alg   = "none"
  authorization_encrypted_response_enc   = "none"
  authorization_signed_response_alg      = "RS256"
  client_secret_expires_at               = 0
  consent_action                         = "always_prompt"
  enforce_pkce                           = true
  grant_types                            = ["authorization_code", "refresh_token"]
  id_token_signed_response_alg           = "RS256"
  request_object_check_expiry            = true
  request_object_lifetime                = 1800
  request_object_parameters_only         = false
  request_object_signing_alg             = "RS256"
  require_pushed_authorization_requests  = false
  response_types                         = ["none", "code"]
  restrict_api_entitlements              = false
  token_endpoint_auth_method             = "default"
  token_endpoint_auth_single_use_jti     = false
}