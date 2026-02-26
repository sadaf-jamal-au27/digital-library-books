# Step-by-step: Deploy Digital Library with Argo CD on GKE

Follow these steps in order. Replace placeholders with your values.

---

## Checklist

- [ ] 1. GKE cluster created and `kubectl` connected
- [ ] 2. Argo CD installed in the cluster
- [ ] 3. Namespace and secrets created (`digital-library`, `app-secrets`)
- [ ] 4. Argo CD Application applied (repo URL set)
- [ ] 5. GitHub secrets set (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`)
- [ ] 6. First push to `main` and verify

---

## 1. Create a GKE cluster and connect kubectl

**Check quota first (recommended):** Run `./k8s/check-gke-quota.sh` to see DISKS/ADDRESSES/SSD usage per region and get a recommended region. Then set that region when creating the cluster (or use the default asia-south1).

**Alternative – Terraform (VPC + subnet + GKE in one go):** Use `terraform/` to create a VPC, subnet, and GKE cluster named **digital-library-gke**. See `terraform/README.md`. Then run `CLUSTER_NAME=digital-library-gke REGION=asia-south1 ./setup-gke-argocd.sh` to install Argo CD and the app.

Set your Google Cloud project and create a cluster (gcloud):

```bash
# Project ID: host-project-486317
export PROJECT_ID=host-project-486317
gcloud config set project $PROJECT_ID

# Create cluster (takes a few minutes). Use 1 node. pd-ssd (free tier).
gcloud container clusters create digital-library-cluster \
  --region asia-south1 \
  --num-nodes 1 \
  --machine-type e2-medium \
  --disk-type pd-ssd \
  --disk-size 30

# Get credentials so kubectl works
gcloud container clusters get-credentials digital-library-cluster --region asia-south1

# Check
kubectl get nodes
```

---

## 2. Install Argo CD in the cluster

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait until Argo CD is ready (1–2 minutes)
kubectl wait --for=condition=Available deployment/argocd-server -n argocd --timeout=300s

# Optional: expose Argo CD UI (for debugging). Get the admin password:
# kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
# Then: kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080 (accept the cert warning), login admin / <password>
```

---

## 3. Create namespace and secrets for the app

Argo CD will create the namespace when it syncs, but the app needs a JWT secret that is not in Git. Create them once:

```bash
# Namespace (optional; Argo CD can create it via syncOptions)
kubectl create namespace digital-library --dry-run=client -o yaml | kubectl apply -f -

# JWT secret (required). Use a strong random value:
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
  -n digital-library
```

**If you use MongoDB Atlas** (recommended for real data), add the Mongo URI secret:

```bash
kubectl create secret generic mongo-uri \
  --from-literal=MONGODB_URI='mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/digital-library?retryWrites=true&w=majority' \
  -n digital-library
```

Then use an overlay that patches the backend to use `MONGODB_URI` from this secret (see DOCKER-K8S.md). If you use **in-cluster Mongo** (default in base), skip the `mongo-uri` secret.

---

## 4. Point Argo CD at your repo and apply the Application

**4.1** Edit `k8s/argocd-application.yaml` and set your Git repo URL:

- Change `YOUR_ORG_OR_USER` to your GitHub username or org.
- If your default branch is `master`, set `targetRevision: master`.

**4.2** Apply the Application (from your machine, in the repo root):

```bash
# From the repo root (digital-library/)
kubectl apply -f k8s/argocd-application.yaml
```

**4.3** Check that Argo CD sees the app and syncs:

```bash
kubectl get applications -n argocd
# You should see digital-library with Synced / Healthy (or Progressing briefly)
```

If the app is **OutOfSync**, Argo CD will sync automatically (we use `syncPolicy.automated`). To sync manually:

```bash
argocd app sync digital-library
# Or if you don't have argocd CLI: wait a minute for auto-sync
```

---

## 5. Add GitHub secrets (for CI to build and push images)

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret.**

Add:

| Name                | Value                          |
|---------------------|--------------------------------|
| `DOCKERHUB_USERNAME`| Your Docker Hub username       |
| `DOCKERHUB_TOKEN`   | Your Docker Hub access token   |

To create a Docker Hub token: Docker Hub → Account Settings → Security → New Access Token.

---

## 6. First push and verify

**6.1** Push your code to `main` (or `master`). The workflow will:

- Run tests
- Build and push backend and frontend images to Docker Hub
- Update `k8s/overlays/dev/kustomization.yaml` with the new image tag and push that commit (`[skip ci]`)
- Argo CD will detect the change and sync, deploying the new images

**6.2** Watch the workflow: **Actions** tab in GitHub.

**6.3** After sync, list workloads:

```bash
kubectl get all -n digital-library
```

**6.4** Access the app:

- **With Ingress (dev overlay):** Add to `/etc/hosts`:  
  `<INGRESS_EXTERNAL_IP> digital-library.local`  
  Then open **http://digital-library.local**
- **Without Ingress:** Port-forward and open http://localhost:8080  
  `kubectl port-forward -n digital-library svc/frontend 8080:80`

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **Quota exceeded** (IN_USE_ADDRESSES, SSD_TOTAL_GB) | Use **1 node** and region **us-east1** (or **us-west1**). Quotas are per-region. Delete failed cluster if any, then create again with `--region asia-south1`. Or request increase: [IAM & Admin → Quotas](https://console.cloud.google.com/iam-admin/quotas). |
| **Unable to connect to the server** | Run `gcloud container clusters get-credentials digital-library-cluster --region asia-south1` (use the same region you used to create the cluster). |
| Argo CD **OutOfSync** or error | Check `repoURL` in `k8s/argocd-application.yaml`. Ensure repo is public or Argo CD has credentials. |
| **ImagePullBackOff** | Push to main so CI builds and pushes images; ensure `k8s/overlays/dev/kustomization.yaml` has a valid `newTag`. |
| **app-secrets** not found | Run: `kubectl create secret generic app-secrets --from-literal=JWT_SECRET="$(openssl rand -base64 32)" -n digital-library` |
