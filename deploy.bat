@echo off

REM Create a temporary directory for deployment
mkdir deploy 2>nul

REM Copy necessary files and directories
xcopy /E /I app deploy\app
xcopy /E /I components deploy\components
xcopy /E /I lib deploy\lib
xcopy /E /I hooks deploy\hooks
xcopy /E /I public deploy\public
xcopy /E /I styles deploy\styles
copy package.json deploy\
copy package-lock.json deploy\
copy tsconfig.json deploy\
copy tailwind.config.ts deploy\
copy postcss.config.mjs deploy\
copy next.config.mjs deploy\
copy components.json deploy\
copy README.md deploy\

REM Create a zip file
powershell Compress-Archive -Path deploy\* -DestinationPath deployment.zip -Force

REM Clean up
rmdir /S /Q deploy

echo Deployment package created: deployment.zip 