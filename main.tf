terraform {
  required_providers {
    ibmverify = {
      source  = "IBM-Verify/ibmverify"
      version = "<provider version>"
    }
    ibm = {
      source = "IBM-Cloud/ibm"
      version = "1.78.3"
    }
    okta = {
      source = "okta/okta"
      version = "~> 4.19.0"
    }
  }
}

provider "ibm" {
  region = "eu-gb"
}

provider "ibmverify" {
  tenant_url                 = var.tenant_url
  service_cred_client_id     = var.service_cred_client_id
  service_cred_client_secret = var.service_cred_client_secret
}

provider "okta" {
  org_name = "[ORG NAME e.g. dev-123456]"
  base_url = "[okta.com|oktapreview.com]"
  client_id = "[APP CLIENT_ID]"
  private_key_id = "[PRIVATE KEY ID - KID]"
  private_key = "[PRIVATE KEY]"
  scopes = "[COMMA,SEPARATED,SCOPE,VALUES]"
}

