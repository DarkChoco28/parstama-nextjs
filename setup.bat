@echo off
echo ========================================
echo  PMR PARSTAMA - Production Setup
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Generating Prisma Client...
call npx prisma generate

echo.
echo [3/4] Pushing database schema...
call npx prisma db push

echo.
echo [4/4] Seeding admin account...
call npx ts-node prisma/seed.ts

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo  Admin Login:
echo    Email:    admin@parstama.id
echo    Password: admin123
echo.
echo  Run 'npm run dev' for development
echo  Run 'npm run build && npm start' for production
echo.
pause
