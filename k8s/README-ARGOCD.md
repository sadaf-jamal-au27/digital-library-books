# Argo CD – GitOps for Digital Library

Argo CD deploys the app from this repo: when you push changes to the `k8s/` manifests (or when CI pushes new images and updates image tags), Argo CD syncs the cluster so it matches Git.

**→ Step-by-step setup (GKE + Argo CD): see [SETUP-ARGOCD-GKE.md](./SETUP-ARGOCD-GKE.md).**

## Layout

- **k8s/base/** – namespace, MongoDB StatefulSet, backend Deployment + Service + PVC, frontend Deployment + Service
- **k8s/overlays/dev/** – dev overlay: uses base + Ingress (`digital-library.local`) + optional patches
- **k8s/argocd-application.yaml** – Argo CD `Application` that points at `k8s/overlays/dev`

## Prerequisites

- Kubernetes cluster (e.g. minikube, kind, EKS, GKE)
- Argo CD installed in the cluster ([install guide](https://argo-cd.readthedocs.io/en/stable/getting_started/))
- Repo pushed to GitHub (or another Git server Argo CD can reach)
- Docker images `sadafjamal3/digital-library-backend` and `sadafjamal3/digital-library-frontend` available (e.g. from GitHub Actions)

## 1. Point Argo CD at your repo

Edit **k8s/argocd-application.yaml** and set `spec.source.repoURL` and, if needed, `targetRevision` (e.g. `main` or `master`):

```yaml
spec:
  source:
    repoURL: https://github.com/YOUR_ORG_OR_USER/digital-library.git
    targetRevision: main
    path: k8s/overlays/dev
```

## 2. Install the Argo CD Application

```bash
kubectl apply -f k8s/argocd-application.yaml
```

(Apply in the cluster where Argo CD is installed; the manifest targets the `argocd` namespace.)

## 3. Sync and access

- Argo CD will create the `digital-library` namespace and deploy MongoDB, backend, and frontend from `k8s/overlays/dev`.
- If **syncPolicy.automated** is set (as in the provided manifest), Argo CD will auto-sync when the Git repo changes.
- With the dev Ingress, open **http://digital-library.local** (add that host to `/etc/hosts` or DNS pointing at your Ingress controller).

## 4. After CI pushes new images

- On each push to `main`/`master`, GitHub Actions (`.github/workflows/docker-build-push.yml`) runs tests, builds and pushes images to Docker Hub, then **updates** `k8s/overlays/dev/kustomization.yaml` with the new image tag (commit SHA or version tag) and pushes that commit with `[skip ci]`.
- **Argo CD** sees the Git change and syncs, deploying the new backend and frontend images. No manual `kubectl` or Image Updater is required.
- To force a rollout without a new build, you can restart the deployments: `kubectl rollout restart deployment/backend deployment/frontend -n digital-library`. Optionally use [Argo CD Image Updater](https://argocd-image-updater.readthedocs.io/) for other workflows.

## 5. Optional: use a specific image tag

In **k8s/overlays/dev/kustomization.yaml**, set `newTag` to a concrete tag (e.g. `v1.0.0` or a git SHA) so deploys are pinned to that image until you change the overlay and push.
