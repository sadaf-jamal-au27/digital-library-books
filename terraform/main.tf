# Digital Library – GKE infrastructure (VPC, subnet, cluster)
# Cluster name: digital-library-gke (slightly different from script-created cluster)

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
resource "google_compute_network" "vpc" {
  name                    = "${var.name_prefix}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  project                 = var.project_id
}

# ---------------------------------------------------------------------------
# Subnet (with secondary ranges for GKE pods and services)
# ---------------------------------------------------------------------------
resource "google_compute_subnetwork" "gke" {
  project       = var.project_id
  name          = "${var.name_prefix}-gke-subnet"
  ip_cidr_range = var.subnet_primary_cidr
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.subnet_pods_cidr
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.subnet_services_cidr
  }
}

# ---------------------------------------------------------------------------
# GKE cluster (digital-library-gke)
# ---------------------------------------------------------------------------
resource "google_container_cluster" "gke" {
  name     = var.cluster_name
  location = var.region
  project  = var.project_id

  deletion_protection = false # set true in production to prevent accidental delete

  # Use our VPC and subnet
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.gke.name

  # VPC-native (alias IP) – use secondary ranges for pods and services
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  initial_node_count = 1

  node_config {
    machine_type = var.node_machine_type
    disk_type    = "pd-ssd"
    disk_size_gb = var.node_disk_size_gb
    spot         = var.use_spot_nodes

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    labels = {
      app = "digital-library"
    }
  }
}
