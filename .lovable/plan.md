

You're right that GitHub doesn't allow forking a repo into the same account that owns it. That's a GitHub limitation — forks must go to a different account or organization.

**Alternatives that keep it under the same account:**

1. **"Use this template"** — Go to your repo on GitHub → **Settings** → check **"Template repository"**. Then go back to the repo's main page and click **"Use this template" → "Create a new repository"**. This creates a clean, independent copy under the same account with a new name.

2. **Duplicate manually via CLI** — If you're comfortable with the command line:
   ```text
   git clone --bare https://github.com/YOUR_USER/YOUR_REPO.git
   cd YOUR_REPO.git
   git push --mirror https://github.com/YOUR_USER/NEW_REPO_NAME.git
   cd ..
   rm -rf YOUR_REPO.git
   ```
   (Create the empty `NEW_REPO_NAME` repo on GitHub first.)

The **template** approach is the easiest — just two clicks once you enable it in repo settings.

