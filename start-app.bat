@echo off
echo Démarrage de l'application Spaced Revision...
echo.

REM Instructions pour l'utilisateur
echo INSTRUCTIONS IMPORTANTES:
echo --------------------------------------------------------------
echo Ce script va essayer de démarrer l'application Spaced Revision.
echo.
echo Si vous rencontrez des erreurs liées à l'exécution de scripts PowerShell,
echo vous devrez ouvrir deux fenêtres de commande séparées et exécuter:
echo.
echo Fenêtre 1: cd backend ^& npm run dev
echo Fenêtre 2: cd spaced-revision ^& npm start
echo --------------------------------------------------------------
echo.

REM Démarrage du serveur backend
echo Démarrage du serveur backend (http://localhost:5000)...
start cmd /k "cd backend & npm run dev"

REM Attente de 3 secondes pour permettre au serveur backend de démarrer
timeout /t 3 /nobreak > nul

REM Démarrage de l'application React frontend
echo Démarrage de l'application React frontend (http://localhost:3000)...
start cmd /k "cd spaced-revision & npm start"

echo.
echo Les deux applications ont été lancées.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Si les applications ne démarrent pas correctement,
echo consultez les instructions ci-dessus.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre (les applications continueront à s'exécuter si elles ont démarré)...

pause > nul
