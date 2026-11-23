# ==============================================================================
# EVEREST PASAL - CLIENT REPOSITORY AUTOMATED PUSH SCRIPT
# Pushes the 4 modularized frontend client repositories to their respective remotes:
# 1. EP-Admin-WebPanel
# 2. EP-Vendor-WebPanel
# 3. EP-Customer-WebPanel
# 4. EP-Customer-Application
# ==============================================================================

param (
    [Parameter(Mandatory=$false)]
    [string]$OrgOrUser = "",

    [Parameter(Mandatory=$false)]
    [string]$TargetRepo = "ALL" # ALL | Admin | Vendor | CustomerWeb | CustomerApp
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Everest Pasal - Client Repositories Push Tool" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

if (-not $OrgOrUser) {
    $OrgOrUser = Read-Host "Enter GitHub Organization or Username (e.g. dynamatrixsolution-hash)"
}

if (-not $OrgOrUser) {
    Write-Host "Error: GitHub Organization or Username is required." -ForegroundColor Red
    exit 1
}

$repos = @(
    @{
        Name = "EP-Admin-WebPanel"
        Path = "client-repos/EP-Admin-WebPanel"
        Description = "Admin Control Center Web Panel"
    },
    @{
        Name = "EP-Vendor-WebPanel"
        Path = "client-repos/EP-Vendor-WebPanel"
        Description = "Vendor Seller Center Web Panel"
    },
    @{
        Name = "EP-Customer-WebPanel"
        Path = "client-repos/EP-Customer-WebPanel"
        Description = "Customer E-Commerce Storefront Web Panel"
    },
    @{
        Name = "EP-Customer-Application"
        Path = "client-repos/EP-Customer-Application"
        Description = "Customer Mobile Application & PWA"
    }
)

foreach ($repo in $repos) {
    if ($TargetRepo -ne "ALL" -and $repo.Name -notlike "*$TargetRepo*") {
        continue
    }

    $repoDir = Join-Path $PSScriptRoot $repo.Path
    $remoteUrl = "https://github.com/$OrgOrUser/$($repo.Name).git"

    Write-Host "`n----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Processing: $($repo.Name) ($($repo.Description))" -ForegroundColor Green
    Write-Host "Remote URL: $remoteUrl" -ForegroundColor Gray
    Write-Host "Directory:  $repoDir" -ForegroundColor Gray
    Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow

    if (-not (Test-Path $repoDir)) {
        Write-Host "Directory $repoDir does not exist. Run 'node scripts/distribute-client-repos.js' first." -ForegroundColor Red
        continue
    }

    Push-Location $repoDir
    try {
        # Initialize Git if not present
        if (-not (Test-Path ".git")) {
            Write-Host "Initializing new git repository..." -ForegroundColor Cyan
            git init
            git branch -M main
        }

        # Configure or update origin remote
        $existingRemote = git remote get-url origin 2>$null
        if ($LASTEXITCODE -eq 0 -and $existingRemote) {
            Write-Host "Updating existing origin remote to $remoteUrl..." -ForegroundColor Cyan
            git remote set-url origin $remoteUrl
        } else {
            Write-Host "Adding origin remote: $remoteUrl..." -ForegroundColor Cyan
            git remote add origin $remoteUrl
        }

        # Stage and commit
        Write-Host "Staging files..." -ForegroundColor Cyan
        git add .
        $status = git status --porcelain
        if ($status) {
            git commit -m "feat: initial commit for $($repo.Name)"
            Write-Host "Committed changes for $($repo.Name)." -ForegroundColor Green
        } else {
            Write-Host "No unstaged changes to commit." -ForegroundColor Gray
        }

        # Push to remote
        $pushConfirm = Read-Host "Push $($repo.Name) to $remoteUrl now? (Y/n)"
        if ($pushConfirm -ne "n" -and $pushConfirm -ne "N") {
            Write-Host "Pushing to $remoteUrl (main)..." -ForegroundColor Cyan
            git push -u origin main --force
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Successfully pushed $($repo.Name)!" -ForegroundColor Green
            } else {
                Write-Host "Push failed for $($repo.Name). Please verify repository exists and you have push access." -ForegroundColor Red
            }
        } else {
            Write-Host "Skipped pushing $($repo.Name)." -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host " Execution Completed." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
