@echo off
chcp 65001 > nul
title 网络配置工具 - PC1

:: 检查是否已以管理员身份运行
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    powershell -Command "Start-Process '%~0' -Verb RunAs" >nul 2>&1
    exit /b
)

goto main

:main
cls
echo 网络配置工具
echo.
echo 1. 配置实验网IP并禁用校园网
echo 2. 恢复校园网
echo.
set /p choice=请选择 [1-2]: 
:choice_check
if "%choice%"=="1" goto config
if "%choice%"=="2" goto restore

set /p choice=无效选择。请重新输入[1-2]:
goto choice_check

:: 配置实验网 + 禁用校园网
:config
cls
for /f "tokens=1,2 delims= " %%A in ('getmac /nh /fo table ^| findstr "..-..-..-..-..-.."') do (
    set mac=%%A
)
echo 检测到MAC地址: %mac%
echo.

if /i "%mac%"=="00-0C-29-F2-AE-EB" (
    echo 识别为PC1，正在配置实验网...
    netsh interface ip set address name="实验网" static 192.168.1.11 255.255.255.0 192.168.1.1 >nul 2>&1 && (
        echo 实验网IP设置成功：IP: 192.168.1.11 子网掩码: 255.255.255.0 默认网关: 192.168.1.1
    ) || (
        echo 实验网IP设置失败
    )
) else if /i "%mac%"=="00-14-22-54-32-10" (
    echo 识别为PC2，正在配置实验网...
    netsh interface ip set address name="实验网" static 192.168.2.11 255.255.255.0 192.168.2.1 >nul 2>&1 && (
        echo 实验网IP设置成功：IP: 192.168.2.11 子网掩码: 255.255.255.0 默认网关: 192.168.2.1
    ) || (
        echo 实验网IP设置失败
    )
) else (
    echo 未识别的主机，无法自动配置。
)

echo.
echo 正在禁用校园网...
netsh interface set interface name="校园网" admin=disable >nul 2>&1
if %errorlevel% equ 0 (
    echo 校园网已禁用
) else (
    echo 校园网禁用失败
)

echo.
pause
goto exit_program

:: 恢复：启用校园网
:restore
cls
echo.
echo 正在启用校园网...
netsh interface set interface name="校园网" admin=enable >nul 2>&1
if %errorlevel% equ 0 (
    echo 校园网已启用
) else (
    echo 校园网启用失败
)

echo.
pause
goto exit_program

:: 退出
:exit_program
exit /b