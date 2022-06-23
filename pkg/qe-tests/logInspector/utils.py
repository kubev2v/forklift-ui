import tarfile
import requests
import yaml


def download_file(url):
    f_name = "must-gather.tar.gz"
    r = requests.get(url,
                     allow_redirects=True,
                     stream=True,
                     verify=False)
    open(f_name, "wb").write(r.content)
    return f_name


def unpack_file(f_name):
    cont = []
    try:
        tar = tarfile.open(f_name, "r:gz")
        try:
            tar.getmember('must-gather')
            tar.extractall()

            # Getting list of files in archive
            for filename in tar.getmembers():
                cont.append(filename.name)
        except KeyError:
            print('Must-gather folder not found in archive, incorrect file?')
        tar.close()
    except FileNotFoundError:
        print("File not found")
    return cont


def read_yaml(filename):
    with open(filename, 'r') as stream:
        try:
            return yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            print(exc)
            return None
