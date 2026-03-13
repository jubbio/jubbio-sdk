#!/bin/bash
set -e

echo "📦 Bumping & publishing @jubbio/auth..."
cd packages/jubbio-auth
npm version patch --no-git-tag-version
npm publish --access public

echo ""
echo "📦 Installing dependencies..."
cd ../..
npm install

echo ""
echo "📦 Bumping & publishing @jubbio/auth-react..."
cd packages/jubbio-auth-react
npm version patch --no-git-tag-version
npm publish --access public

echo ""
echo "✅ Done! Both packages published."

echo ""
echo "📝 Committing..."
cd ../..
git add -A
git commit -m "chore: publish @jubbio/auth + @jubbio/auth-react"
git push

echo "🚀 All done!"
