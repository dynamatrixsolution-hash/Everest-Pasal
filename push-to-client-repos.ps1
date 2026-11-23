# ==============================================================================
# EVEREST PASAL - CLIENT REPOSITORY AUTOMATED PUSH SCRIPT
# Target Organization: Everest-Pasal
# Author: nirmal9089 <nirmal@everestpasal.com>
# Repositories:
#   1. https://github.com/Everest-Pasal/EP-Admin-WebPanel.git
#   2. https://github.com/Everest-Pasal/EP-Vendor-WebPanel.git
#   3. https://github.com/Everest-Pasal/EP-Customer-WebPanel.git
#   4. https://github.com/Everest-Pasal/EP-Customer-Application.git
# ==============================================================================

param (
    [Parameter(Mandatory=$false)]
    [string]$Org = "Everest-Pasal",

    [Parameter(Mandatory=$false)]
    [string]$GitUser = "nirmal9089",

    [Parameter(Mandatory=$false)]
    [string]$GitEmail = "nirmal@everestpasal.com",

    [Parameter(Mandatory=$false)]
    [string]$TargetRepo = "ALL" # ALL | Admin | Vendor | CustomerWeb | CustomerApp
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Everest Pasal - Client Repositories Push Tool" -ForegroundColor Cyan
Write-Host " Organization: $Org" -ForegroundColor Green
Write-Host " Author:       $GitUser <$GitEmail>" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

$repos = @(
    @{
        Name = "EP-Admin-WebPanel"
        Path = "client-repos/EP-Admin-WebPanel"
        Url = "https://github.com/Everest-Pasal/EP-Admin-WebPanel.git"
        Description = "Admin Control Center Web Panel"
    },
    @{
        Name = "EP-Vendor-WebPanel"
        Path = "client-repos/EP-Vendor-WebPanel"
        Url = "https://github.com/Everest-Pasal/EP-Vendor-WebPanel.git"
        Description = "Vendor Seller Center Web Panel"
    },
    @{
        Name = "EP-Customer-WebPanel"
        Path = "client-repos/EP-Customer-WebPanel"
        Url = "https://github.com/Everest-Pasal/EP-Customer-WebPanel.git"
        Description = "Customer E-Commerce Storefront Web Panel"
    },
    @{
        Name = "EP-Customer-Application"
        Path = "client-repos/EP-Customer-Application"
        Url = "https://github.com/Everest-Pasal/EP-Customer-Application.git"
        Description = "Customer Mobile Application & PWA"
    }
)

foreach ($repo in $repos) {
    if ($TargetRepo -ne "ALL" -and $repo.Name -notlike "*$TargetRepo*") {
        continue
    }

    $repoDir = Join-Path $PSScriptRoot $repo.Path
    $remoteUrl = $repo.Url

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

        # Set specific user identity
        git config user.name "$GitUser"
        git config user.email "$GitEmail"

        # Configure or update origin remote
        $existingRemote = git remote get-url origin 2>$null
        if ($LASTEXITCODE -eq 0 -and $existingRemote) {
            git remote set-url origin $remoteUrl
        } else {
            git remote add origin $remoteUrl
        }

        # Stage and commit
        Write-Host "Staging files..." -ForegroundColor Cyan
        git add .
        $status = git status --porcelain
        if ($status) {
            git commit --author="$GitUser <$GitEmail>" -m "feat: initial release of $($repo.Name)"
            Write-Host "Committed changes for $($repo.Name)." -ForegroundColor Green
        } else {
            Write-Host "Working tree clean. Ready to push." -ForegroundColor Gray
        }

        # Push to remote
        Write-Host "Pushing $($repo.Name) to $remoteUrl (main)..." -ForegroundColor Cyan
        git push -u origin main --force
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully pushed $($repo.Name)!" -ForegroundColor Green
        } else {
            Write-Host "Push failed for $($repo.Name). Please verify repository exists and you have push access." -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host " All tasks executed." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
