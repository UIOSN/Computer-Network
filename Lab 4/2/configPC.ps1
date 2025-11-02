[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "网络配置工具"

# ====================== 常量定义 ======================
$PC1_MAC = "6C-B3-11-3F-CA-E8"
$PC1_IP = "172.17.10.10"
$PC1_MASK = 24
$PC1_GATEWAY = "172.17.10.1"

# $PC2_MAC = "6C-B3-11-3F-CA-EB"

$PC3_MAC = "00-1B-21-57-36-5F"
$PC3_IP = "192.168.1.10"
$PC3_MASK = 24
$PC3_GATEWAY = "192.168.1.2"

$EXPERIMENT = "实验网"
$CAMPUS = "校园网"

$WEBSITE_NAME = "Group2_Website"
$FTP_NAME = "Group2_FTP"
# =====================================================

function Show-Menu {
    Write-Host "`n网络配置工具`n" -ForegroundColor Cyan
    Write-Host "[1] 配置实验网IP"
    Write-Host "[2] 配置实验网为DHCP"
    Write-Host "[3] 禁用校园网"
    Write-Host "[4] 启用校园网"
    Write-Host "[5] 启用FTP和Web服务"
    Write-Host "[6] 停止FTP和Web服务"
    Write-Host ""
}

# 获取实验网 MAC 地址
$experimentAdapter = Get-NetAdapter -Name $EXPERIMENT -ErrorAction SilentlyContinue
$macAddress = $experimentAdapter.MacAddress -replace ":", "-"
Write-Host "`n$EXPERIMENT MAC: $macAddress"

Show-Menu

while ($true) {
    $choice = Read-Host "`n请选择(按q退出)"
    if ($choice -eq 'q') {
        exit
    }
    $startWebSite = $false
    $startFTP = $false
    switch ($choice) {
        '1' {
            # 配置实验网IP
            $experimentAdapter = Get-NetAdapter -Name $EXPERIMENT -ErrorAction SilentlyContinue
            if ($macAddress -eq $PC1_MAC) {
                Write-Host "识别为 PC1，正在配置实验网..." -ForegroundColor Green
                try {
                    New-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -IPAddress $PC1_IP -PrefixLength $PC1_MASK -DefaultGateway $PC1_GATEWAY -ErrorAction Stop | Out-Null
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Disabled | Out-Null
                    Write-Host "$EXPERIMENT 配置成功：IP=$PC1_IP/$PC1_MASK 网关=$PC1_GATEWAY" -ForegroundColor Green
                }
                catch {
                    Write-Host "IP 配置失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            elseif ($macAddress -eq $PC2_MAC) {
                Write-Host "识别为 PC2，正在配置实验网..." -ForegroundColor Green
                try {
                    New-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -IPAddress $PC2_IP -PrefixLength $PC2_MASK -DefaultGateway $PC2_GATEWAY -ErrorAction Stop | Out-Null
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Disabled | Out-Null
                    Write-Host "$EXPERIMENT 配置成功：IP=$PC2_IP/$PC2_MASK 网关=$PC2_GATEWAY" -ForegroundColor Green
                }
                catch {
                    Write-Host "IP 配置失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            elseif ($macAddress -eq $PC3_MAC) {
                Write-Host "识别为 PC3，正在配置实验网..." -ForegroundColor Green
                try {
                    New-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -IPAddress $PC3_IP -PrefixLength $PC3_MASK -DefaultGateway $PC3_GATEWAY -ErrorAction Stop | Out-Null
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Disabled | Out-Null
                    Write-Host "$EXPERIMENT 配置成功：IP=$PC3_IP/$PC3_MASK 网关=$PC3_GATEWAY" -ForegroundColor Green
                }
                catch {
                    Write-Host "IP 配置失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "未识别的主机 MAC 地址，无法自动配置。" -ForegroundColor Yellow
            }
        }
        '2' {
            # 设置实验网为 DHCP
            $experimentAdapter = Get-NetAdapter -Name $EXPERIMENT -ErrorAction SilentlyContinue
            if ($experimentAdapter) {
                try {
                    Remove-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -Confirm:$false -ErrorAction SilentlyContinue
                    Remove-NetRoute -InterfaceIndex $experimentAdapter.ifIndex -Confirm:$false -ErrorAction SilentlyContinue
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Enabled
                    Write-Host "$EXPERIMENT 已设置为自动获取 IP (DHCP)。" -ForegroundColor Green
                }
                catch {
                    Write-Host "$EXPERIMENT DHCP 设置失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "未找到 '$EXPERIMENT' 接口。" -ForegroundColor Yellow
            }
        }
        '3' {
            # 禁用校园网
            $campusAdapter = Get-NetAdapter -Name $CAMPUS -ErrorAction SilentlyContinue
            if ($campusAdapter) {
                try {
                    Disable-NetAdapter -Name $CAMPUS -Confirm:$false -ErrorAction Stop
                    Write-Host "$CAMPUS 已禁用。" -ForegroundColor Green
                }
                catch {
                    Write-Host "$CAMPUS 禁用失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "未找到 '$CAMPUS' 接口，跳过禁用。" -ForegroundColor Yellow
            }    
        }
        '4' {
            # 启用校园网
            $campusAdapter = Get-NetAdapter -Name $CAMPUS -ErrorAction SilentlyContinue
            if ($campusAdapter) {
                if ($campusAdapter.Status -ne 'Up') {
                    try {
                        Enable-NetAdapter -Name $CAMPUS -ErrorAction Stop
                        Write-Host "$CAMPUS 已启用。" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "$CAMPUS 启用失败: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
                else {
                    Write-Host "$CAMPUS 已经处于启用状态。" -ForegroundColor Gray
                }
            }
            else {
                Write-Host "未找到 '$CAMPUS' 接口。" -ForegroundColor Yellow
            }
        }
        '5' {
            # 启用FTP和Web服务
            # 安装所需的Windows功能
            $enable = $true
            try {
                $features = @("IIS-FTPServer", "IIS-FTPSvc", "IIS-WebServer", "IIS-WebServerRole", "IIS-WebServerManagementTools")
                foreach ($feature in $features) {
                    $featureState = Get-WindowsOptionalFeature -Online -FeatureName $feature
                    if ($featureState.State -ne "Enabled") {
                        Write-Host "正在启用 Windows 功能: $feature ..." -ForegroundColor Yellow
                        Enable-WindowsOptionalFeature -Online -FeatureName $feature -NoRestart -ErrorAction Stop | Out-Null
                    }
                }
            }
            catch {
                Write-Host "启用Windows功能失败: $($_.Exception.Message)" -ForegroundColor Red
                $enable = $false
            }

            if ($enable) {
                Start-Service ftpsvc
                Import-Module WebAdministration

                # 如果已经存在站点，则直接启动
                if (Get-Website -Name $WEBSITE_NAME -ErrorAction SilentlyContinue) {
                    Start-Website -Name $WEBSITE_NAME
                    Write-Host "已启动默认网站。" -ForegroundColor Green
                    $startWebSite = $true
                }
                if (Get-Website -Name $FTP_NAME -ErrorAction SilentlyContinue) {
                    Start-Service -Name "FTPSVC"
                    Write-Host "已启动默认FTP站点。" -ForegroundColor Green
                    $startFTP = $true
                }

                # 创建新的默认网站
                $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
                if (!$startWebSite) {
                    $httpRoot = Join-Path $scriptDir "http"
                    try {
                        New-WebSite -Name $WEBSITE_NAME -Port 80 -PhysicalPath $httpRoot -ErrorAction Stop
                        # 设置权限
                        $acl = Get-Acl $httpRoot
                        $accessRule1 = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
                        $accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("IUSR", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
                        $acl.AddAccessRule($accessRule1)
                        $acl.AddAccessRule($accessRule2)
                        Set-Acl $httpRoot $acl
                        Write-Host "已创建默认网站。" -ForegroundColor Green
                        $startWebSite = $true
                    }
                    catch {
                        Write-Host "创建默认网站失败: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }

                if (!$startFTP) {
                    # 创建新的默认FTP站点
                    $ftpRoot = Join-Path $scriptDir "ftp"
                    try {
                        New-WebFtpSite -Name $FTP_NAME -Port 21 -PhysicalPath $ftpRoot -ErrorAction Stop

                        # 启用匿名身份验证和基本身份验证
                        Set-WebConfiguration "/system.applicationHost/sites/site[@name='$FTP_NAME']/ftpServer/security/authentication/anonymousAuthentication" -Value @{enabled = "True" }
                        Set-WebConfiguration "/system.applicationHost/sites/site[@name='$FTP_NAME']/ftpServer/security/authentication/basicAuthentication" -Value @{enabled = "True" }
                        # 禁用SSL
                        Set-WebConfiguration "/system.applicationHost/sites/site[@name='$FTP_NAME']/ftpServer/security/ssl" -Value @{
                            controlChannelPolicy = "SslAllow"
                            dataChannelPolicy    = "SslAllow"
                            # serverCertStoreName = "MY"
                            # ssl128 = "false"
                        }

                        # 设置权限
                        $acl = Get-Acl $ftpRoot
                        $accessRule1 = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "Read, Synchronize, Write", "ContainerInherit,ObjectInherit", "None", "Allow")
                        $accessRule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("IUSR", "Read, Synchronize, Write", "ContainerInherit,ObjectInherit", "None", "Allow")
                        $acl.AddAccessRule($accessRule1)
                        $acl.AddAccessRule($accessRule2)
                        Set-Acl $ftpRoot $acl
                        Add-WebConfiguration -Filter "/system.ftpServer/security/authorization" -PSPath "MACHINE/WEBROOT/APPHOST" -Location "$FTP_NAME" -Value @{
                            accessType  = "Allow"
                            users       = "*"
                            permissions = "Read, Write"
                        }
                        Write-Host "已创建默认FTP站点。" -ForegroundColor Green
                        $startFTP = $true
                    }
                    catch {
                        Write-Host "创建默认FTP站点失败: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        } '6' {
            # 停止FTP和Web服务
            Import-Module WebAdministration

            try {
                Stop-WebSite -Name $WEBSITE_NAME -ErrorAction Stop
                $startWebSite = $false
                Stop-Service -Name "FTPSVC" -Force -ErrorAction Stop
                $startFTP = $false
                Write-Host "FTP和Web服务已停止。" -ForegroundColor Green
            }
            catch {
                Write-Host "停止FTP和Web服务失败: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        Default {
            # 执行输入的命令
            try {
                Invoke-Expression $choice
            }
            catch {
                Write-Host "命令执行失败: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}