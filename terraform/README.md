# Terraform – Digital Library GKE infra (VPC + subnet + cluster)

Creates the full network and GKE cluster in one go. Cluster name: **digital-library-gke**.

## What it creates

| Resource | Name / purpose |
|----------|----------------|
| **VPC** | `digital-library-vpc` |
| **Subnet** | `digital-library-gke-subnet` (primary + secondary ranges for pods/services) |
| **GKE cluster** | `digital-library-gke` (1 node, e2-medium, pd-ssd 30 GB) |

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- `gcloud` logged in and project set: `gcloud auth application-default login` and `gcloud config set project host-project-486317`

## Quick start

```bash
cd terraform
terraform init
terraform plan   # optional
terraform apply  # type yes when prompted
```

After apply, get kubectl credentials:

```bash
gcloud container clusters get-credentials digital-library-gke --region asia-south1 --project host-project-486317
kubectl get nodes
```

Then install Argo CD and deploy the app (from repo root). The script will see the cluster exists and skip create, then install Argo CD + secrets + Application:

```bash
CLUSTER_NAME=digital-library-gke REGION=asia-south1 ./setup-gke-argocd.sh
```

Or run the Argo CD steps manually (see `k8s/SETUP-ARGOCD-GKE.md` steps 2–5), using cluster **digital-library-gke** and region **asia-south1**.

## Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `project_id` | host-project-486317 | GCP project |
| `region` | asia-south1 | Region for VPC subnet and GKE |
| `cluster_name` | digital-library-gke | GKE cluster name |
| `name_prefix` | digital-library | Prefix for VPC and subnet names |
| `node_machine_type` | e2-small | Node VM type (cheaper; use e2-medium for more headroom) |
| `node_disk_size_gb` | 20 | Boot disk size (pd-ssd) |
| `use_spot_nodes` | false | Set true for spot nodes (cheaper, may be evicted) |

Override via `terraform.tfvars` or `-var project_id=...`.

## Outputs

- `get_credentials` – command to configure kubectl
- `cluster_name`, `cluster_region`, `vpc_name`, `subnet_name`

## Destroy

```bash
terraform destroy
```

Type `yes` when prompted. This deletes the cluster, subnet, and VPC.
