# Move to Cluster to the datacenter root folder 
# Reuiered: install.ps1 
#
# Environment Params Required:
$clustername=Get-Content Env:/CLUSTER_NAME  
$datacentername = Get-Content Env:/DATACENTER_NAME

. ./connect.ps1
Move-Cluster -Cluster $clustername -Destination $datacentername


