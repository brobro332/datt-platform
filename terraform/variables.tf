variable "existing_instance_ocid" {
  type        = string
  description = "OCID of the existing OCI Compute Instance to bind the reserved IP to"
}

variable "tenancy_ocid" {
  type        = string
  description = "OCI Tenancy OCID"
}

variable "user_ocid" {
  type        = string
  description = "OCI User OCID"
}

variable "fingerprint" {
  type        = string
  description = "OCI API Key Fingerprint"
}

variable "private_key" {
  type        = string
  description = "OCI API Private Key content"
  sensitive   = true
}

variable "region" {
  type        = string
  description = "OCI Region"
  default     = "ap-chuncheon-1"
}

variable "compartment_ocid" {
  type        = string
  description = "OCI Compartment OCID where resources will be created"
}

variable "bucket_name" {
  type        = string
  description = "OCI Object Storage Bucket Name"
  default     = "datt-image-bucket"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content for VM instance access"
}

variable "instance_shape" {
  type        = string
  description = "OCI Compute Instance Shape"
  default     = "VM.Standard.A1.Flex"
}

variable "instance_ocpu" {
  type        = number
  description = "Number of OCPUs for flex shape"
  default     = 4
}

variable "instance_memory_in_gbs" {
  type        = number
  description = "Amount of memory in GBs for flex shape"
  default     = 24
}
