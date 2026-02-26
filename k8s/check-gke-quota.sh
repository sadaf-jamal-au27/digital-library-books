#!/usr/bin/env bash
# Check GKE-relevant quota per region and recommend one with headroom.
# Run from repo root: ./k8s/check-gke-quota.sh
# Setup uses pd-ssd (30 GB); we need SSD_TOTAL_GB, DISKS_TOTAL_GB and IN_USE_ADDRESSES.

set -e

PROJECT_ID="${PROJECT_ID:-host-project-486317}"
REGIONS="asia-south1 asia-southeast1 us-east1 us-west1 us-central1 europe-west1"
SSD_NEEDED=35

gcloud config set project "$PROJECT_ID" --quiet 2>/dev/null

echo "Quota check for project: $PROJECT_ID"
echo "Regions: $REGIONS"
echo "Cluster uses pd-ssd (30 GB); need SSD, DISKS and IN_USE_ADDRESSES headroom."
echo ""

pick=""
for r in $REGIONS; do
  out=$(gcloud compute regions describe "$r" --project="$PROJECT_ID" --format=json 2>/dev/null) || continue
  eval $(echo "$out" | python3 -c "
import json,sys
d=json.load(sys.stdin)
q={x['metric']:x for x in d.get('quotas',[])}
d_use = q.get('DISKS_TOTAL_GB',{}).get('usage',0) or 0
d_lim = q.get('DISKS_TOTAL_GB',{}).get('limit',0) or 0
a_use = q.get('IN_USE_ADDRESSES',{}).get('usage',0) or 0
a_lim = q.get('IN_USE_ADDRESSES',{}).get('limit',0) or 0
s_use = q.get('SSD_TOTAL_GB',{}).get('usage',0) or 0
s_lim = q.get('SSD_TOTAL_GB',{}).get('limit',0) or 0
d_free = d_lim - d_use
a_free = a_lim - a_use
s_free = s_lim - s_use
ok = d_free >= 30 and a_free >= 1 and s_free >= 35
print('disks_usage=%s disks_limit=%s addr_usage=%s addr_limit=%s ssd_use=%s ssd_lim=%s ok=%s' % (d_use,d_lim,a_use,a_lim,s_use,s_lim,ok))
" 2>/dev/null)
  if [ "$ok" = "True" ]; then
    echo "  $r: DISKS ${disks_usage}/${disks_limit} GB, ADDRESSES ${addr_usage}/${addr_limit}, SSD ${ssd_use}/${ssd_lim} GB -> OK"
    [ -z "$pick" ] && pick=$r
  else
    echo "  $r: DISKS ${disks_usage}/${disks_limit} GB, ADDRESSES ${addr_usage}/${addr_limit}, SSD ${ssd_use}/${ssd_lim} GB -> LOW QUOTA"
  fi
done

echo ""
if [ -n "$pick" ]; then
  echo "Recommended region: $pick"
  echo "Run: REGION=$pick ./setup-gke-argocd.sh"
else
  echo "No region with enough quota. Free up resources or request a quota increase."
  exit 1
fi
