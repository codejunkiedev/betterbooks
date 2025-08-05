#!/bin/bash

echo "🚀 Running custom build script for branch: $VERCEL_GIT_COMMIT_REF"

if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
    echo "✅ Detected MAIN branch → Running Production Build"
    npm run build:prod
elif [ "$VERCEL_GIT_COMMIT_REF" = "staging" ]; then
    echo "🟡 Detected STAGING branch → Running Staging Build"
    npm run build:staging
elif [ "$VERCEL_GIT_COMMIT_REF" = "dev" ]; then
    echo "🔵 Detected DEV branch → Running Development Build"
    npm run build:dev
else
    echo "🔄 Detected Other branch ($VERCEL_GIT_COMMIT_REF) → Running Production Build"
    npm run build:prod
fi

echo "✨ Build completed for $VERCEL_GIT_COMMIT_REF branch"