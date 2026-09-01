#!/usr/bin/env bash
set -euo pipefail

project="$PWD"
quality=82
og_quality=90
delete_source=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) project="$2"; shift 2 ;;
    --quality) quality="$2"; shift 2 ;;
    --og-quality) og_quality="$2"; shift 2 ;;
    --delete-source) delete_source=1; shift ;;
    -h|--help)
      echo "Usage: optimize-images.sh [--project DIR] [--quality 82] [--og-quality 90] [--delete-source]"
      exit 0
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

images_dir="$project/public/images"
[[ -d "$images_dir" ]] || { echo "Missing $images_dir" >&2; exit 1; }
command -v cwebp >/dev/null 2>&1 || { echo "cwebp is required on PATH" >&2; exit 1; }

converted=0
while IFS= read -r -d '' source; do
  output="${source%.*}.webp"
  cwebp -quiet -mt -m 6 -q "$quality" "$source" -o "$output"
  converted=$((converted + 1))
  if [[ "$delete_source" -eq 1 ]]; then rm "$source"; fi
done < <(find "$images_dir" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

for source in "$project/public/og.png" "$project/public/og.jpg" "$project/public/og.jpeg"; do
  if [[ -f "$source" ]]; then
    cwebp -quiet -mt -m 6 -q "$og_quality" "$source" -o "$project/public/og.webp"
    converted=$((converted + 1))
    if [[ "$delete_source" -eq 1 ]]; then rm "$source"; fi
    break
  fi
done

echo "Converted $converted raster asset(s) to WebP."
