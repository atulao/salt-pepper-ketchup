# Security Guide

## API Key Security

This project uses external APIs that require authentication keys. To maintain security:

1. **Never commit API keys** to the repository
2. Store API keys in environment variables using `.env.local` files
3. Use empty fallbacks or placeholder values in code

## Removing API Keys from Git History

If you accidentally committed API keys, follow these steps to remove them from the git history:

### Option 1: Using BFG Repo Cleaner (Recommended)

BFG is faster and simpler than git filter-branch for removing sensitive data.

1. Clone a fresh copy of your repository:
   ```bash
   git clone --mirror https://github.com/yourusername/salt-pepper-ketchup.git
   ```

2. Download the BFG Jar file from https://rtyley.github.io/bfg-repo-cleaner/

3. Create a text file `replace-keys.txt` with the sensitive data:
   ```
   AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg=***REMOVED***
   pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xnOGkweGQxMDNpaDNmc2VubWZrZXdhbiJ9.qjK1MmN90xJl1QrN3FrMOQ=***REMOVED***
   ```

4. Run BFG to replace the API keys in all files:
   ```bash
   java -jar bfg.jar --replace-text replace-keys.txt salt-pepper-ketchup.git
   ```

5. Clean up and push:
   ```bash
   cd salt-pepper-ketchup.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

### Option 2: Using git filter-repo

If you can't use BFG, you can use git filter-repo:

1. Install git filter-repo:
   ```bash
   pip install git-filter-repo
   ```

2. Clone a fresh copy of your repository:
   ```bash
   git clone https://github.com/yourusername/salt-pepper-ketchup.git
   cd salt-pepper-ketchup
   ```

3. Create a replacement script `replace-keys.py`:
   ```python
   import git_filter_repo as gfr
   
   def my_callback(text):
       return text.replace(b'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg', b'***REMOVED***') \
                 .replace(b'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xnOGkweGQxMDNpaDNmc2VubWZrZXdhbiJ9.qjK1MmN90xJl1QrN3FrMOQ', b'***REMOVED***')
   
   gfr.FilteringOptions.path_changes = {}
   gfr.FilterRepo(blob_callback=lambda blob: gfr.Blob(blob.id, my_callback(blob.data)))
   ```

4. Run the script:
   ```bash
   git-filter-repo --force --source salt-pepper-ketchup --use-backup
   ```

5. Push the changes:
   ```bash
   git push --force
   ```

## Important: Invalidate Compromised Keys

After removing secrets from your repository:

1. **Always invalidate any exposed API keys** and generate new ones
2. For Google Maps, go to the Google Cloud Console and regenerate the key
3. For MapBox, go to the MapBox developer dashboard and regenerate the key
4. Update your `.env.local` file with the new keys

## Additional Security Measures

1. Consider using a secrets scanning tool like GitGuardian or GitHub Secret Scanning
2. Set up pre-commit hooks to prevent committing sensitive data
3. Add proper patterns to your `.gitignore` file for all environment files

## Reporting Security Issues

If you discover a security vulnerability, please send an email to [security@example.com](mailto:security@example.com). All security vulnerabilities will be promptly addressed. 