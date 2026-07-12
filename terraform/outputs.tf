output "instance_public_ip" {
  value       = oci_core_public_ip.datt_reserved_ip.ip_address
  description = "The reserved public IP address bound to the DATT Compute Instance"
}

output "object_storage_namespace" {
  value       = data.oci_objectstorage_namespace.ns.namespace
  description = "The Object Storage Namespace"
}

output "bucket_url" {
  value       = "https://objectstorage.${var.region}.oraclecloud.com/n/${data.oci_objectstorage_namespace.ns.namespace}/b/${oci_objectstorage_bucket.datt_bucket.name}"
  description = "The base URL of the OCI storage bucket"
}
