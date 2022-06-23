from log_parser import file_parser
from models.disk_volume import Dv
from utils import read_yaml


class Vm:
    def __init__(self, name, cont, hook=False):
        self.name = name
        self.id = ""
        self.kind = 'VirtualMachine'
        self.cont = cont
        self.hook = hook
        self.cr_filename = ""
        self.hookcr_filename = ""
        self.hook_yaml = None
        self.hook_log = ""
        self.vm_yaml = None
        self.error_state = False
        self.error_message = ""
        self.log_filename = ""
        self.volume_list = []
        self.dv_list = []
        self.first_init()

    def first_init(self):
        try:
            self.cr_filename = list(filter(lambda filename: self.name in filename, self.cont))[0]
            self.vm_yaml = read_yaml(self.cr_filename)
            self.id = self.vm_yaml['metadata']['labels']['vmID']
            self.volume_list = self.vm_yaml['spec']['template']['spec']['volumes']
            for current_volume in self.volume_list:
                self.dv_list.append(Dv(current_volume['dataVolume']['name'], self.cont))
        except IndexError:
            print("Error, archive doesn't contain VM CR")
            exit(-1)

        # Getting log file for a VM
        for line in self.cont:
            if 'current' in line and self.id in line and not 'hook' in line:
                self.log_filename = line
            if self.hook and 'current' in line and self.id in line and 'hook' in line:
                self.hook_log = line
        if self.log_filename == "":
            print("Error, archive doesn't contain VM log")
            self.error_state = True

        if self.hook:
            try:
                self.hookcr_filename = list(filter(lambda filename: 'hook' in filename,
                                                   list(filter(lambda filename: self.id in filename, self.cont))))[0]
                self.hook_yaml = read_yaml(self.hookcr_filename)
                pass
            except IndexError:
                print("Error, archive doesn't contain HOOK CR")
                self.error_state = True

    def validate(self):
        # Validating that CR has proper 'kind' and VM name is expected
        if self.vm_yaml['kind'] != self.kind or self.vm_yaml['metadata']['name'] != self.name:
            print("VM's CR validation failed, wrong `kind`")
            self.error_state = True

        # Iterating DVs that were found in VM CR and validating them
        for current_dv in self.dv_list:
            current_dv.validate()
            if self.id != current_dv.id or current_dv.error_state:
                self.error_state = True

        # Validating that VM name was found in respective log and log length is not less than 20 lines
        total_found, length = file_parser(self.log_filename, self.name)
        if total_found < 1 or length < 20:
            print("Log problem found")
            print("VM name was found times: %i" % total_found)
            print("Lines in log found: %i" % length)
            self.error_state = True

        print('VM CR filename:', self.cr_filename)
        print('VM log: ', self.log_filename)

        if self.hook:
            print('Hook CR filename:', self.hookcr_filename)
            print('Hook log:', self.hook_log)
            if self.hook_yaml['kind'] != 'Job' or self.hook_yaml['metadata']['labels']['vmID'] != self.id:
                print('Job CR validation failed!')
                self.error_state = True

        print(
            'VM %s validated' % self.name
            if not self.error_state
            else "VM %s validation failed" % self.name
        )

        print("-" * 30)
