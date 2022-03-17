# Setup: Connect to VMware Server & Create a new folder and a sub folder insdie this folder
# Reuiered: install.ps1 
#
# Environment Param Required:
$folder_name = Get-Content Env:/FOLDER_NAME
$sub_folder_name = Get-Content Env:/SUB_FOLDER_NAME

. ./connect.ps1

New-Folder -Name  $folder_name -Location (Get-Datacenter)[0]
New-Folder -Name  $sub_folder_name -Location $folder_name


