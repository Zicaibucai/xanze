#!/usr/bin/env bash
set -Eeuo pipefail

readonly persistent_root=/var/lib/oceanbase
readonly persistent_store="${persistent_root}/store"
readonly demo_store=/root/demo/store
readonly memory_limit="${OCEANBASE_MEMORY_LIMIT:-4G}"
readonly cpu_count="${OCEANBASE_CPU_COUNT:-4}"

mkdir -p "${persistent_store}"

if [[ ! -e "${persistent_store}/sstable/block_file" ]]; then
  echo "Initializing the persistent OceanBase slim store..."
  unsquashfs -f -d "${persistent_store}" /root/demo/store.img
fi

if [[ -e "${demo_store}" && ! -L "${demo_store}" ]]; then
  echo "${demo_store} must be absent or a symbolic link" >&2
  exit 1
fi

ln -sfn "${persistent_store}" "${demo_store}"
sed -i \
  "s/^    memory_limit:.*$/    memory_limit: ${memory_limit}/" \
  /root/.obd/cluster/demo/config.yaml
sed -i \
  "s/^    cpu_count:.*$/    cpu_count: ${cpu_count}/" \
  /root/.obd/cluster/demo/config.yaml

exec /root/boot/start.sh
