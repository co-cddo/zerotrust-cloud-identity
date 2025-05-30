# GCP Configuration
gcp_project_id     = "your-gcp-project-id"
gcp_project_number = "your-gcp-project-number"

# Okta OIDC Configuration
okta_issuer_uri    = "https://your-okta-domain.okta.com/oauth2/default" # Example: https://dev-123456.okta.com/oauth2/default
okta_client_id     = "your-okta-oidc-app-client-id"

# Instructions:
# 1. Rename this file to "terraform.tfvars".
# 2. Replace the placeholder values above with your actual GCP project ID, project number,
#    Okta issuer URI, and Okta OIDC application client ID.
#
# - gcp_project_id: The unique identifier for your Google Cloud project.
# - gcp_project_number: The numerical identifier for your Google Cloud project.
# - okta_issuer_uri: The issuer URI of your Okta OIDC application.
#                    This is typically found in your Okta application's settings.
# - okta_client_id: The client ID of your Okta OIDC application that will be used
#                   for federating identities with GCP.