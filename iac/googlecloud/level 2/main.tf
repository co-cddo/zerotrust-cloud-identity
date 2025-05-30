# main.tf

# Configure the Google Cloud Provider
provider "google" {
  # project = "your-gcp-project-id" # Optional: if not set by environment or gcloud config
  # region  = "your-gcp-region"     # Optional: if not set by environment or gcloud config
}


# 1. Create a Workload Identity Pool
resource "google_iam_workload_identity_pool" "okta_pool" {
  project = var.gcp_project_id
  workload_identity_pool_id = "okta-terraform-pool"
  display_name              = "Okta tf Workload Id Pool"
  description               = "Workload Identity Pool for Okta-authenticated Terraform runs."
  disabled                  = false
}

# 2. Create an OIDC Provider within the Workload Identity Pool for Okta
resource "google_iam_workload_identity_pool_provider" "okta_provider" {
  project                  = var.gcp_project_id
  workload_identity_pool_id = google_iam_workload_identity_pool.okta_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "okta-oidc-provider"
  display_name               = "Okta OIDC Provider"
  description                = "OIDC Provider for Okta authentication."
  disabled                   = false

  oidc {
    issuer_uri           = var.okta_issuer_uri # e.g., "https://your-okta-domain.okta.com/oauth2/default"
    allowed_audiences    = [var.okta_client_id] # Your Okta OIDC Client ID
    jwks_json            = null # Leave null for public OIDC endpoints
  }

  attribute_mapping = {
    "google.subject" = "assertion.sub" # Map Okta's 'sub' claim to GCP's subject
    "attribute.email" = "assertion.email" # Example: Map Okta's 'email' claim to a custom attribute
    # Add other attribute mappings as needed for your conditional access policies
  }

  attribute_condition = "" # Optional: Add CEL conditions here, e.g., "attribute.email.endsWith('@yourdomain.com')"
}

# 3. Create a Google Cloud Service Account for Terraform to impersonate
resource "google_service_account" "terraform_sa" {
  project      = var.gcp_project_id
  account_id   = "terraform-okta-sa"
  display_name = "Service Account for Okta-federated Terraform"
}

# 4. Grant the Workload Identity Pool Provider permission to impersonate the Service Account
resource "google_service_account_iam_member" "workload_identity_user_binding" {
  service_account_id = google_service_account.terraform_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${var.gcp_project_number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.okta_pool.workload_identity_pool_id}/providers/${google_iam_workload_identity_pool_provider.okta_provider.workload_identity_pool_provider_id}"
}

# 5. Grant necessary permissions to the Service Account
# Example: Granting Project Editor role (adjust to least privilege principle!)
resource "google_project_iam_member" "sa_permissions" {
  project = var.gcp_project_id
  role    = "roles/editor" # **CRITICAL**: Use the principle of least privilege here!
  member  = "serviceAccount:${google_service_account.terraform_sa.email}"
}

# Variables for your Terraform configuration
variable "gcp_project_id" {
  description = "Your GCP Project ID"
  type        = string
}

variable "gcp_project_number" {
  description = "Your GCP Project Number"
  type        = string
}

variable "okta_issuer_uri" {
  description = "Your Okta OIDC Issuer URI"
  type        = string
}

variable "okta_client_id" {
  description = "Your Okta OIDC Client ID"
  type        = string
}

output "workload_identity_provider_name" {
  value = google_iam_workload_identity_pool_provider.okta_provider.name
  description = "The full resource name of the Workload Identity Pool Provider"
}

output "service_account_email" {
  value = google_service_account.terraform_sa.email
  description = "The email of the service account for impersonation"
}