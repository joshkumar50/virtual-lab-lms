# Deployment Script for Virtual Lab LMS
# This script commits changes and pushes to GitHub, triggering automatic deployment

Write-Host "🚀 Virtual Lab LMS Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in a git repository
if (!(Test-Path .git)) {
    Write-Host "❌ Not in a git repository. Please run from the project root directory." -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "📦 Adding all changes..." -ForegroundColor Yellow
git add .

# Commit with a descriptive message
$commitMessage = "Fix submission flow: Update API calls and backend grading endpoint

- Fixed StudentAssignments and TeacherSubmissions to use configured API instance
- Updated submission endpoint to use correct courseId parameter  
- Fixed backend grading endpoint to properly find submissions in assignments
- Added debugging logs for better troubleshooting
- Updated WARP.md with submission flow documentation

Fixes issue where student submissions weren't visible in teacher dashboard."

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to main branch
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green
Write-Host "📱 Your Vercel and Render deployments should automatically update" -ForegroundColor Cyan
Write-Host "🔍 Monitor the deployment status:" -ForegroundColor Cyan
Write-Host "   - Vercel: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "   - Render: https://dashboard.render.com/" -ForegroundColor Blue

Write-Host "`n🧪 After deployment completes:" -ForegroundColor Magenta
Write-Host "1. Test student assignment submission" -ForegroundColor White
Write-Host "2. Check teacher dashboard for submissions" -ForegroundColor White
Write-Host "3. Test grading functionality" -ForegroundColor White
Write-Host "4. Check browser console for API debugging logs" -ForegroundColor White