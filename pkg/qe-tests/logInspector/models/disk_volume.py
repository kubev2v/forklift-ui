from log_parser import file_parser
from utils import read_yaml


class Dv:
    def __init__(self, name, cont):
        self.name = name
        self.kind = 'DataVolume'
        self.cont = cont
        self.cr_filename = ""
        self.dv_yaml = None
        self.id = ""
        self.error_state = False
        self.error_message = ""
        self.log_filename = ""
        self.first_init()

    def first_init(self):
        try:
            self.cr_filename = list(filter(lambda filename: self.name in filename, self.cont))[0]
            self.dv_yaml = read_yaml(self.cr_filename)
            self.id = self.dv_yaml['metadata']['labels']['vmID']
        except IndexError:
            print("Error, archive doesn't contain DV CR")
            exit(-1)

        # Getting log file for a DV
        try:
            self.log_filename = list(filter(lambda filename: 'current' in filename,
                                            list(filter(lambda filename: self.name in filename, self.cont))))[0]
        except IndexError:
            print("Error, archive doesn't contain DV log")
            self.error_state = True

    def validate(self):
        assert self.dv_yaml['metadata']['name'] == self.name
        assert self.dv_yaml['kind'] == self.kind
        if self.dv_yaml['metadata']['name'] != self.name or self.dv_yaml['kind'] != self.kind:
            self.error_state = True

        total_found, length = file_parser(self.log_filename, self.id)
        if total_found < 1 or length < 20:
            self.error_state = True

        print('DV CR filename:', self.cr_filename)
        print('DV log: ', self.log_filename)
        print(
            'DV %s validated' % self.name
            if not self.error_state
            else "DV %s validation failed" % self.name
        )
