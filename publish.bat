@echo off
REM [syntax] publish [patch|minor|major] [-m "commit message"]
REM default: patch, "chore: build for publish"

:: set EXTENSION_DIR="{{EXTENSION_ROOT}}\{{name}}"
set EXTENSION_DIR=C:\JnJ\Developments\jd-chromeExtensions\jce-clipper

:: 플러그인 디렉토리가 없으면 생성
if not exist "%EXTENSION_DIR%" mkdir "%EXTENSION_DIR%"

SET mode=patch
SET commit_msg=chore: build for publish

:parse_args
IF "%~1"=="" GOTO end_parse
IF "%~1"=="-m" (
    SET commit_msg=%~2
    SHIFT
    SHIFT
    GOTO parse_args
)
IF "%~1"=="patch" (
    SET mode=patch
    SHIFT
    GOTO parse_args
)
IF "%~1"=="minor" (
    SET mode=minor
    SHIFT
    GOTO parse_args
)
IF "%~1"=="major" (
    SET mode=major
    SHIFT
    GOTO parse_args
)
SHIFT
GOTO parse_args
:end_parse

REM 1. git pull 먼저 실행하여 원격 변경사항 가져오기
git pull
if errorlevel 1 goto :error

REM 2. 빌드
call npm run build
if errorlevel 1 goto :error

REM 5. 변경사항 커밋
git add .
if errorlevel 1 goto :error
git commit -m "chore: release version %version%"
if errorlevel 1 goto :error

REM 6. git push
git push --follow-tags
if errorlevel 1 goto :error

REM 3. npm 버전 업데이트 (이때 자동으로 버전 태그가 생성됨)
call npm version %mode%
if errorlevel 1 goto :error

REM 4. package.json의 버전을 manifest.json에 적용
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set version=%%i
node -e "const fs = require('fs'); const manifest = require('./dist/manifest.json'); manifest.version = '%version%'; fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2) + '\n');"
if errorlevel 1 goto :error


:: 7. chrome extension 배포
del /Q "%EXTENSION_DIR%\*"
xcopy /E /Y "dist\*" "%EXTENSION_DIR%\"

goto :success

:error
echo 오류가 발생했습니다.
exit /b 1

:success
echo 배포가 성공적으로 완료되었습니다.
exit /b 0
