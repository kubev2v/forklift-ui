# Establish a Conncetio Session with the Server

# Enviroment Parameters
$server = Get-Content Env:/SERVER
$user = Get-Content Env:/USER
$password = Get-Content Env:/PASSWORD
$ignorecert = Test-Path -Path Env:/IGNORE_CERT_CHECK 

if ($ignorecert)
{
        echo Ignoring Certification Errors
        Set-PowerCLIConfiguration -InvalidCertificateAction:Ignore

}
else
{
        Set-PowerCLIConfiguration -InvalidCertificateAction:Fail

}

Connect-VIServer  -Server $server -User $user -Password $password

