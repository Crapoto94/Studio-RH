@echo off
TITLE RH Studio - Lancement
echo ===================================================
echo   LANCEMENT DE RH STUDIO (Mode Developpement)
echo ===================================================
echo.
echo [1/2] Verification de la configuration...
if not exist .env (
    echo [ERREUR] Fichier .env manquant.
    pause
    exit /b
)

echo [2/2] Demarrage du serveur Next.js...
echo.
npm run dev

pause
