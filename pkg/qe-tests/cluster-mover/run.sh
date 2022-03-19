# Create a Cluster Folder And A sub Folder
# Move the Given Cluster to the Folder 
# Wait for the Forklift Inventory to be updated
# Move the Given Cluster to the sub folder 
# Wait for the Forklift Inventory to be updated

# Enviroment Params Requiered
# CLUSTER_NAME (vmware)
# SERVER (vmware)
# USER (vmware)
# PASSWORD (wmware) 
# IGNOR_CERT_CHECK (optional) is set to any value, all certification  errors are ignored (vmware + openshift)
# FORKLIFT_NAMESPACE (openshift)
# K8_API_URL (openshift)
# K8_API_KEY (openshift)

export FOLDER_NAME="auto-test"
export SUB_FOLDER_NAME="sub-auto-test"

cd /runner

# Tear Down Only
# Enviroment Params Requiered
# TEARDOWN
# CLUSTER_NAME
# DATACENTER_NAME
if ! [ -z $TEARDOWN ]; then
	echo Moving Cluster $CLUSTER_NAME back to $DATACENTER_NAME		
	echo A|pwsh -File t-down.ps1
	exit 0
fi

echo Creating Temp Folders in VMware
echo A|pwsh -File set-up.ps1

echo Move the Cluster to Folder $FOLDER_NAME
echo A|pwsh -File move-cluster-to-folder.ps1

echo Wait for Forklift Inventory Update
/usr/bin/python3.6 forklift_inventory_runner.py wait_for_host_in_folder

if [ $? -ne 0 ]; then echo Failed!; exit 1;fi

echo Move the Cluster to Folder $SUB_FOLDER_NAME
export FOLDER_NAME=$SUB_FOLDER_NAME
echo A|pwsh -File move-cluster-to-folder.ps1

echo Wait for Forklift Inventory Update
/usr/bin/python3.6 forklift_inventory_runner.py wait_for_host_in_folder

if [ $? -ne 0 ]; then echo Failed!; exit 1;fi

echo Operation Completed Successfully




