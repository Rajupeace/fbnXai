@echo off
echo ========================================
echo   DASHBOARD FIX - STARTUP SCRIPT
echo ========================================
echo.

echo Step 1: Checking MongoDB...
node backend\quick_db_check.js
if errorlevel 1 (
    echo.
    echo ERROR: MongoDB is not running!
    echo Please start MongoDB first:
    echo   net start MongoDB
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Testing API Endpoints...
node backend\test_api_endpoints.js
if errorlevel 1 (
    echo.
    echo ERROR: Backend server is not running!
    echo.
    echo Please start the backend in a separate terminal:
    echo   cd backend
    echo   node index.js
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ALL CHECKS PASSED!
echo ========================================
echo.
echo Your dashboards should be working now!
echo.
echo NEXT STEPS:
echo 1. Make sure backend is running (cd backend ^&^& node index.js)
echo 2. Make sure frontend is running (npm start)
echo 3. Clear browser cache (Ctrl+Shift+Delete)
echo 4. Login to test dashboards
echo.
echo If you see "Demo Student" or empty data:
echo - Restart backend server
echo - Clear browser cache
echo - Logout and login again
echo.
pause
