@echo off
title Application Spaced Revision - Démarrage

echo --------------------------------------------------------------
echo           DÉMARRAGE DE L'APPLICATION SPACED REVISION
echo --------------------------------------------------------------
echo.
echo Cette application se compose de deux parties :
echo  - Un serveur backend (API Node.js/Express)
echo  - Une interface frontend (React)
echo.
echo Les deux parties vont être démarrées automatiquement.
echo --------------------------------------------------------------
echo.

REM Vérifie si les répertoires existent avant de démarrer
if not exist "backend" (
    echo ERREUR: Le répertoire 'backend' est introuvable.
    goto error
)

if not exist "spaced-revision" (
    echo ERREUR: Le répertoire 'spaced-revision' est introuvable.
    goto error
)

REM Démarrage du serveur backend (avec plus de robustesse)
echo Démarrage du serveur backend (http://localhost:5000)...
start "Backend Server" cmd /k "cd %~dp0backend && npm run dev"

REM Attente de 5 secondes pour permettre au serveur backend de démarrer
echo Attente du démarrage du backend...
timeout /t 5 /nobreak > nul

REM Démarrage de l'application React frontend
echo Démarrage de l'application React frontend (http://localhost:3000)...
start "Frontend Server" cmd /k "cd %~dp0spaced-revision && npm start"

echo.
echo Les deux applications ont été lancées.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Si les applications ne démarrent pas correctement, veuillez:
echo 1. Exécuter manuellement 'npm run dev' dans le répertoire backend
echo 2. Exécuter manuellement 'npm start' dans le répertoire spaced-revision
echo.
echo Appuyez sur une touche pour fermer cette fenêtre (les applications continueront à s'exécuter)...
goto end

:error
echo.
echo ERREUR DE DÉMARRAGE: Veuillez vérifier que les répertoires sont corrects.
echo.

:end
pause > nul
