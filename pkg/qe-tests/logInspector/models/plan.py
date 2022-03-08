# from log_parser import file_parser
from log_parser import file_parser
from utils import read_yaml


class Plan:
    def __init__(self, name, cont):
        self.kind = 'Plan'
        self.name = name
        self.vm_list = []
        self.cr_filename = ""
        self.log_filename = ""
        self.target_ns = ""
        self.plan_yaml = None
        self.error_state = False
        self.error_message = ""
        self.cont = cont
        self.first_init(name)

    def first_init(self, plan_name):
        print('Plan name', plan_name)
        # Getting CR filename for a plan
        try:
            self.cr_filename = list(filter(lambda filename: plan_name in filename, self.cont))[0]
        except IndexError:
            print("Error, archive doesn't contain plan CR")
            exit(-1)

        # Getting log file for a plan
        try:
            self.log_filename = list(filter(lambda filename: 'forklift' in filename, self.cont))[1]
        except IndexError:
            print("Error, archive doesn't contain forklift log")
            self.error_state = True

        # Getting dictionary from plan yaml
        self.plan_yaml = read_yaml(self.cr_filename)

        # Getting target namespace from dict
        self.target_ns = self.plan_yaml['spec']['targetNamespace']

    def validate(self):
        # Making sure plan name in dict is matching expected plan name
        if self.plan_yaml['kind'] != self.kind or self.name != self.plan_yaml['metadata']['name']:
            self.error_state = True

        for current_vm in self.vm_list:
            current_vm.validate()
            if current_vm.error_state:
                self.error_state = True

        # Validating that Plan name was found in respective log and log length is not less than 20 lines
        total_found, length = file_parser(self.log_filename, self.name)
        if total_found < 1 or length < 20:
            self.error_state = True

        print('Plan CR filename:', self.cr_filename)
        print('Plan log:', self.log_filename)

        print(
            'Plan %s validated' % self.name
            if not self.error_state
            else "Plan %s validation failed" % self.name
        )
