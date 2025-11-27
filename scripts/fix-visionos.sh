#!/bin/bash

# Fix visionOS compatibility issues with CocoaPods < 1.13

echo "🔧 Fixing visionOS compatibility issues..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Find and fix all podspec files with visionOS references
echo "📝 Patching podspec files..."

find node_modules -name "*.podspec" -type f -print0 | while IFS= read -r -d '' file; do
    if grep -q "visionos" "$file"; then
        echo "  - Patching: $file"
        # Comment out any line that references visionOS to avoid issues with older CocoaPods
        sed -i '' '/visionos/s/^/# /' "$file"
    fi
done

echo "✅ Patching complete!"
echo ""
echo "Now run:"
echo "  cd ios && pod install"

