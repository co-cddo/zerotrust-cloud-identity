resource "ibm_code_engine_app" "code_engine_app_instance" {
  project_id      = var.project_id
  name            = var.app_name
  image_reference = var.image_reference
  image_secret = var.image_secret


  dynamic "run_env_variables" {
    for_each = var.run_env_variables
    content {
      type  = "literal"
      name  = run_env_variables.value.name
      value = run_env_variables.value.value
    }
  }
}

