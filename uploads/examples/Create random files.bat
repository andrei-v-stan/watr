@echo off
setlocal

echo Select a file size:
echo 1. 1KB
echo 2. 10KB
echo 3. 100KB
echo 4. 1MB
echo 5. 25MB
echo 6. 100MB
echo 7. 250MB
echo 8. 500MB
echo 9. 1GB
echo 10. 5GB
echo 11. 10GB
echo 12. 25GB
echo 13. 50GB
echo 14. 100GB

set /p choice=Enter your choice (1-14): 

set /p "filename=Enter the name of the file (e.g., Super random file.txt) [Default: test.txt]: "

if "%filename%"=="" set filename=test.txt

if "%choice%"=="1" set /a bytes=1024
if "%choice%"=="2" set /a bytes=10240
if "%choice%"=="3" set /a bytes=102400
if "%choice%"=="4" set /a bytes=1048576
if "%choice%"=="5" set /a bytes=26214400
if "%choice%"=="6" set /a bytes=104857600
if "%choice%"=="7" set /a bytes=262144000
if "%choice%"=="8" set /a bytes=524288000
if "%choice%"=="9" set /a bytes=1073741824
if "%choice%"=="10" set /a bytes=5368709120
if "%choice%"=="11" set /a bytes=10737418240
if "%choice%"=="12" set /a bytes=26843545600
if "%choice%"=="13" set /a bytes=53687091200
if "%choice%"=="14" set /a bytes=107374182400

fsutil file createnew "%filename%" %bytes%

echo File "%filename%" of size %bytes% bytes has been created.

endlocal
pause
