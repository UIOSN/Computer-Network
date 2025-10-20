[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "网络配置工具"

# ====================== 常量定义 ======================
$PC1_MAC = "6C-B3-11-3F-CA-E8"
$PC1_IP = "192.168.1.11"
$PC1_MASK = "255.255.255.0"
$PC1_GATEWAY = "192.168.1.1"

$PC2_MAC = "6C-B3-11-3F-CA-EB"
$PC2_IP = "192.168.2.11"
$PC2_MASK = "255.255.255.0"
$PC2_GATEWAY = "192.168.2.1"

# $PC3_MAC = "00-1B-21-57-36-5F"

$EXPERIMENT = "实验网"
$CAMPUS = "校园网"

# =====================================================

function Show-Menu {
    Write-Host "`n网络配置工具`n" -ForegroundColor Cyan
    Write-Host "[1] 配置实验网IP"
    Write-Host "[2] 配置实验网为DHCP"
    Write-Host "[3] 禁用校园网"
    Write-Host "[4] 启用校园网"
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
    switch ($choice) {
        '1' {
            # 配置实验网IP
            $experimentAdapter = Get-NetAdapter -Name $EXPERIMENT -ErrorAction SilentlyContinue
            if ($macAddress -eq $PC1_MAC) {
                Write-Host "识别为 PC1，正在配置实验网..." -ForegroundColor Green
                try {
                    New-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -IPAddress $PC1_IP -PrefixLength 24 -DefaultGateway $PC1_GATEWAY -ErrorAction Stop | Out-Null
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Disabled | Out-Null
                    Write-Host "$EXPERIMENT 配置成功：IP=$PC1_IP 子网掩码=$PC1_MASK 网关=$PC1_GATEWAY" -ForegroundColor Green
                }
                catch {
                    Write-Host "IP 配置失败: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            elseif ($macAddress -eq $PC2_MAC) {
                Write-Host "识别为 PC2，正在配置实验网..." -ForegroundColor Green
                try {
                    New-NetIPAddress -InterfaceIndex $experimentAdapter.ifIndex -IPAddress $PC2_IP -PrefixLength 24 -DefaultGateway $PC2_GATEWAY -ErrorAction Stop | Out-Null
                    Set-NetIPInterface -InterfaceIndex $experimentAdapter.ifIndex -Dhcp Disabled | Out-Null
                    Write-Host "$EXPERIMENT 配置成功：IP=$PC2_IP 子网掩码=$PC2_MASK 网关=$PC2_GATEWAY" -ForegroundColor Green
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
        Default {
            Write-Host "无效选择，请重新输入" -ForegroundColor Red
        }
    }
}