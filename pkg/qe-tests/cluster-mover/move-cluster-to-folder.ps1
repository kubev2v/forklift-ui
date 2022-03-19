# Move a VMware cluster (by cluster name) to a folder (by folder name) 
#
# Enviroment Params Requiered
$clustername=Get-Content Env:/CLUSTER_NAME
$foldername=Get-Content Env:/FOLDER_NAME
$server = Get-Content Env:/SERVER
$sub_folder_name = Get-Content Env:/SUB_FOLDER_NAME

. ./connect.ps1

$cluster = Get-Cluster -Name $clustername
$folder = Get-Folder -Name $foldername

echo **********Cluster_Folder_Before_Moving****************************************************************
$parentfolderbefore = $cluster.ParentFolder
echo $parentfolderbefore
echo ******************************************************************************************************


echo Moving Cluster
Move-Cluster -Cluster $cluster -Destination $folder

echo **********Cluster_Folder_After_Moving*****************************************************************
$cluster = Get-Cluster -Name $clustername
$parentfolderafter = $cluster.ParentFolder
echo $parentfolderafter
echo ******************************************************************************************************
