#!/bin/bash

# Script to deploy the SOS Tourist Doctor API to GitHub

echo "SOS Tourist Doctor API - GitHub Deployment Script"
echo "=================================================="

echo "Before running this script, please ensure you have:"
echo "1. Created a new repository on GitHub"
echo "2. Copied the repository URL"
echo ""
echo "Enter your GitHub repository URL (e.g., https://github.com/username/repository.git):"
read repo_url

# Add the remote origin
echo "Adding remote origin..."
git remote add origin $repo_url

# Rename branch to main
echo "Renaming branch to main..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "Deployment completed!"
echo "Visit your repository on GitHub to verify the files are uploaded."