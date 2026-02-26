variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "host-project-486317"
}

variable "region" {
  description = "GCP region for VPC subnet and GKE cluster"
  type        = string
  default     = "asia-south1"
}

variable "name_prefix" {
  description = "Prefix for VPC and subnet names"
  type        = string
  default     = "digital-library"
}

variable "cluster_name" {
  description = "GKE cluster name (slightly different from script default)"
  type        = string
  default     = "digital-library-gke-01"
}

variable "subnet_primary_cidr" {
  description = "Primary CIDR for the GKE subnet (nodes, etc.)"
  type        = string
  default     = "10.0.0.0/20"
}

variable "subnet_pods_cidr" {
  description = "Secondary CIDR for GKE pods"
  type        = string
  default     = "10.4.0.0/14"
}

variable "subnet_services_cidr" {
  description = "Secondary CIDR for GKE services"
  type        = string
  default     = "10.8.0.0/20"
}

variable "node_machine_type" {
  description = "GKE node machine type (e2-small = cheaper, e2-medium = more headroom)"
  type        = string
  default     = "e2-small"
}

variable "node_disk_size_gb" {
  description = "Boot disk size (GB) per node; pd-ssd"
  type        = number
  default     = 20
}

variable "use_spot_nodes" {
  description = "Use spot (preemptible) nodes for lower cost; may be evicted"
  type        = bool
  default     = false
}
