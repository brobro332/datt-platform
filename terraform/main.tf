terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key      = var.private_key
  region           = var.region
}

# Namespace of OCI Object Storage
data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_ocid
}

# Virtual Cloud Network (VCN)
resource "oci_core_vcn" "datt_vcn" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.compartment_ocid
  display_name   = "datt-vcn"
  dns_label      = "dattvcn"
}

# Internet Gateway
resource "oci_core_internet_gateway" "datt_ig" {
  compartment_id = var.compartment_ocid
  display_name   = "datt-internet-gateway"
  vcn_id         = oci_core_vcn.datt_vcn.id
}

# Route Table
resource "oci_core_route_table" "datt_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.datt_vcn.id
  display_name   = "datt-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.datt_ig.id
  }
}

# Security List (Firewall rules)
resource "oci_core_security_list" "datt_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.datt_vcn.id
  display_name   = "datt-security-list"

  # Egress (Outbound) - allow all traffic to internet
  egress_security_rules {
    destination      = "0.0.0.0/0"
    protocol         = "all"
    destination_type = "CIDR_BLOCK"
  }

  # Ingress (Inbound) - HTTP (80)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 80
      max = 80
    }
  }

  # Ingress (Inbound) - HTTPS (443)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Ingress (Inbound) - SSH (22)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Ingress (Inbound) - Spring Boot API (8080)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 8080
      max = 8080
    }
  }

  # Ingress (Inbound) - PostgreSQL DB (5432)
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 5432
      max = 5432
    }
  }
}

# Subnet (Public)
resource "oci_core_subnet" "datt_subnet" {
  cidr_block        = "10.0.1.0/24"
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.datt_vcn.id
  display_name      = "datt-public-subnet"
  dns_label         = "dattpublic"
  route_table_id    = oci_core_route_table.datt_rt.id
  security_list_ids = [oci_core_security_list.datt_sl.id]
}

# OCI Object Storage Bucket (Public Read for web display)
resource "oci_objectstorage_bucket" "datt_bucket" {
  compartment_id = var.compartment_ocid
  name           = var.bucket_name != "" && var.bucket_name != null ? var.bucket_name : "datt-image-bucket"
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  access_type    = "ObjectRead" 
  storage_tier   = "Standard"
}

# Get latest Ubuntu 22.04 LTS Image OCID dynamically
data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = var.instance_shape
  state                    = "AVAILABLE"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Fetch Availability Domains dynamically
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_ocid
}

# OCI Compute Instance (VM)
data "oci_core_instance" "datt_vm" {
  instance_id = var.existing_instance_ocid
}

# 1. Fetch VM's Primary VNIC details
data "oci_core_vnic_attachments" "datt_vnics" {
  compartment_id = var.compartment_ocid
  instance_id    = data.oci_core_instance.datt_vm.id
}

data "oci_core_vnic" "datt_vnic" {
  vnic_id = data.oci_core_vnic_attachments.datt_vnics.vnic_attachments[0].vnic_id
}

# 2. Fetch VM's Primary Private IP details
data "oci_core_private_ips" "datt_private_ips" {
  vnic_id = data.oci_core_vnic.datt_vnic.id
}

# 3. Create Reserved Public IP and bind it to the private IP
resource "oci_core_public_ip" "datt_reserved_ip" {
  compartment_id = var.compartment_ocid
  lifetime       = "RESERVED"
  display_name   = "datt-reserved-public-ip"
  private_ip_id  = data.oci_core_private_ips.datt_private_ips.private_ips[0].id
}
