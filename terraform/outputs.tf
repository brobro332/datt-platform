output "instance_public_ip" {
  value       = data.oci_core_instance.datt_vm.public_ip
  description = "The public IP address of the existing DATT Compute Instance"
}

output "object_storage_namespace" {
  value       = data.oci_objectstorage_namespace.ns.namespace
  description = "The Object Storage Namespace"
}

output "bucket_url" {
  value       = "https://objectstorage.${var.region}.oraclecloud.com/n/${data.oci_objectstorage_namespace.ns.namespace}/b/${var.bucket_name != "" && var.bucket_name != null ? var.bucket_name : "datt-image-bucket"}"
  description = "The base URL of the OCI storage bucket"
}
