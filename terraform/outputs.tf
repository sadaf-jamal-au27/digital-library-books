output "vpc_name" {
  description = "Name of the VPC"
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "Name of the GKE subnet"
  value       = google_compute_subnetwork.gke.name
}

output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.gke.name
}

output "cluster_region" {
  description = "GKE cluster region"
  value       = var.region
}

output "get_credentials" {
  description = "Run this to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.gke.name} --region ${var.region} --project ${var.project_id}"
}
