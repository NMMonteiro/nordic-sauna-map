@echo off
title Deploy Nordic Sauna Map to Live
color 0b
echo ========================================================
echo   Deploying Nordic Sauna Map to Google Firebase Hosting
echo ========================================================
echo.
cd /d "d:\Dropbox\Tropical Astral team Dropbox\PROJECTS\Nordic Sauna Project - LM\Website\nordic-sauna-map - recovered"
echo [1/2] Checking Firebase login...
call npx firebase-tools login
echo.
echo [2/2] Deploying to live website (nordicsaunamap.com)...
call npx firebase-tools deploy --only hosting
echo.
echo ========================================================
echo   Deployment Complete! Live at https://nordicsaunamap.com
echo ========================================================
pause
