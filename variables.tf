variable "project_id" {
  description = "ID of the IBM cloud project"
}

variable "app_name" {
  description = "name given to deployed code engine app"
}

variable "project_id" {
  description = "ID of the IBM cloud project"
}

variable "image_reference" {
  description = "container image to use"
}

variable "image_secret" {}

variable "run_env_variables" {
  description = "envrionment variables to be injected into app runtime"
  type = list(object({
    name  = string
    value = string
  }))
}


variable "client_name" {
    type = string
    description = "IBM Verify client name"
}

variable "redirect_uris" {
  type = list
  description = "IBM verify redirect uris"
}

variable "azure_app_name" { 
    type = string 
    description = "Azure AD app registration name"
}

