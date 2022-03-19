FROM registry.access.redhat.com/ubi8/ubi
RUN mkdir /install
COPY ./microsoft.repo /etc/yum.repos.d/
RUN yum install -y powershell python3 python3-pip 
COPY ./requirements.txt /install
RUN pip3 install -r /install/requirements.txt

#use sha256 to be  fips complaince (instead of md5)
COPY ./discovery.py /usr/local/lib/python3.6/site-packages/kubernetes/dynamic/discovery.py
RUN rm -rf /install
RUN mkdir /runner
COPY ./forklift_inventory.py /runner
COPY ./forklift_inventory_runner.py /runner
COPY ./move-cluster-to-folder.ps1 /runner  
COPY ./install.ps1 /runner
COPY ./t-down.ps1 /runner
COPY ./set-up.ps1 /runner
COPY ./connect.ps1 /runner
COPY ./run.sh /runner
RUN pwsh -File /runner/install.ps1
CMD /bin/sh /runner/run.sh
