#!/bin/bash

find . -type f -name "*.scm" | while read -r file; do
  grep -o '@[^_ ][^ ]*' "$file" | sed 's/^@//; s/[^a-zA-Z0-9_.-]//g; s/.*/"&",/'
done | sort -u
