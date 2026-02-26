#!/usr/bin/env bash
# Setup GKE cluster + Argo CD for Digital Library.
# Run from repo root: ./setup-gke-argocd.sh
# Optional: export GIT_REPO_URL=https://github.com/YOUR_USER/digital-library.git
# To pick region by quota: ./k8s/check-gke-quota.sh then REGION=<recommended> ./setup-gke-argocd.sh

set -e

PROJECT_ID="${PROJECT_ID:-host-project-486317}"
CLUSTER_NAME="${CLUSTER_NAME:-digital-library-cluster}"
REGION="${REGION:-asia-south1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Project: $PROJECT_ID | Cluster: $CLUSTER_NAME | Region: $REGION"
echo "    (Override: PROJECT_ID=... REGION=... ./setup-gke-argocd.sh)"
echo "    (Check quota first: ./k8s/check-gke-quota.sh)"
echo ""

# 1. GKE cluster
echo "==> 1. Setting project and creating GKE cluster (1 node)..."
gcloud config set project "$PROJECT_ID"

if gcloud container clusters describe "$CLUSTER_NAME" --region "$REGION" &>/dev/null; then
  echo "    Cluster already exists, skipping create."
else
  if ! gcloud container clusters create "$CLUSTER_NAME" \
    --region "$REGION" \
    --num-nodes 1 \
    --machine-type e2-medium \
    --disk-type pd-ssd \
    --disk-size 30; then
    echo ""
    echo "    Cluster create failed (often due to quota)."
    echo "    Try: REGION=us-west1 ./setup-gke-argocd.sh   (or request quota in GCP Console → IAM & Admin → Quotas)"
    exit 1
  fi
fi

echo "==> 2. Getting kubectl credentials..."
gcloud container clusters get-credentials "$CLUSTER_NAME" --region "$REGION"
kubectl get nodes
echo ""

# 3. Argo CD
echo "==> 3. Installing Argo CD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "    Waiting for Argo CD server (up to 5 min)..."
kubectl wait --for=condition=Available deployment/argocd-server -n argocd --timeout=300s 2>/dev/null || true
echo ""

# 4. Namespace and secrets
echo "==> 4. Creating namespace and app-secrets..."
kubectl create namespace digital-library --dry-run=client -o yaml | kubectl apply -f -

if kubectl get secret app-secrets -n digital-library &>/dev/null; then
  echo "    app-secrets already exists, skipping."
else
  kubectl create secret generic app-secrets \
    --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
    -n digital-library
fi
echo ""

# 5. Argo CD Application
echo "==> 5. Applying Argo CD Application..."
APP_FILE="k8s/argocd-application.yaml"
if [ -n "${GIT_REPO_URL}" ]; then
  sed "s|repoURL:.*|repoURL: $GIT_REPO_URL|" "$APP_FILE" | kubectl apply -f -
  echo "    Repo URL set to: $GIT_REPO_URL"
else
  kubectl apply -f "$APP_FILE"
  echo "    NOTE: If sync fails, set repoURL in k8s/argocd-application.yaml and run: kubectl apply -f k8s/argocd-application.yaml"
fi
echo ""

echo "==> Done."
echo ""
echo "Next steps:"
echo "  1. Add GitHub secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN"
echo "  2. Ensure k8s/argocd-application.yaml has your repo URL (e.g. https://github.com/YOUR_USER/digital-library.git)"
echo "  3. Push to main → CI builds images and updates Git → Argo CD syncs"
echo "  4. Access app: kubectl port-forward -n digital-library svc/frontend 8080:80  then open http://localhost:8080"
echo ""
