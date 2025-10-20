@echo off
chcp 65001 >nul
title 网络配置工具

:: 请求管理员权限
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    powershell -Command "Start-Process '%~0' -Verb RunAs" >nul 2>&1
    exit /b
)

:: 检查PS1文件是否存在
if not exist "%~dp0configPC.ps1" (
    echo 错误：找不到 configPC.ps1 文件
    pause
    exit /b 1
)

:: 执行PowerShell脚本
powershell -ExecutionPolicy Bypass -File "%~dp0configPC.ps1"

if %errorlevel% neq 0 (
    echo PowerShell脚本执行失败（错误码：%errorlevel%）
) else (
    echo PowerShell脚本执行成功
)