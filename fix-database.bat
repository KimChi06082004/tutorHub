@echo off
echo Creating password_reset_otps table...
mysql -u root websitedaythem < backend\create-otp-table.sql
if %errorlevel% equ 0 (
    echo ✅ Table created successfully!
) else (
    echo ❌ Failed to create table. Make sure MySQL is running.
)
pause
