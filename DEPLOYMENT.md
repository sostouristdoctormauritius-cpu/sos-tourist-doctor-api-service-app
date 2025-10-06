# Deployment to GitHub

This document explains how to deploy the SOS Tourist Doctor API service app to GitHub.

## Steps to deploy to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com and log in
   - Click the "+" icon in the top right corner and select "New repository"
   - Name your repository (e.g., "sos-tourist-doctor-api")
   - Optionally add a description
   - Choose Public or Private
   - **Important**: Do NOT initialize with a README, .gitignore, or license
   - Click "Create repository"

2. After creating the repository, you'll see a page with repository details and setup instructions.
   Copy the repository URL which will look like: `https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git`

3. Open a terminal/command prompt in the project directory and run these commands:

```bash
# Add the GitHub repository as a remote (replace with your actual URL)
git remote add origin YOUR_REPOSITORY_URL

# Rename the branch to main (GitHub's default)
git branch -M main

# Push the code to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed, you can create and push to a repository with:

```bash
# Create a new repository on GitHub and push the code
gh repo create sos-tourist-doctor-api --public --push
```

## Verification

After pushing, you can visit your repository URL on GitHub to verify that all files have been uploaded correctly.