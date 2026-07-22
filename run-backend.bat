@echo off
echo ================================================================
echo   CMS - Cafe Management System
echo   Backend Spring Boot Server
echo ================================================================
echo.
echo [INFO] JAVA_HOME = C:\Users\HPC\.jdks\graalvm-jdk-17.0.12
echo [INFO] Backend will start at http://localhost:8080
echo [INFO] Swagger UI: http://localhost:8080/swagger-ui.html
echo [INFO] Default admin: admin / Admin@123
echo.

set "JAVA_HOME=C:\Users\HPC\.jdks\graalvm-jdk-17.0.12"
set "PATH=%JAVA_HOME%\bin;%PATH%"

call gradlew.bat bootRun
pause
