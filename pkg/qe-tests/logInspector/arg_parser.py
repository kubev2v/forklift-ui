import argparse


def create_parser():
    cli_parser = argparse.ArgumentParser()
    cli_parser.add_argument('-u', '--url',
                            help='URL of archive file to be downloaded, unarchived and parsed',
                            dest='url',
                            nargs='+'
                            )
    cli_parser.add_argument('-f', '--file',
                            help='File name that should be unarchived and parsed',
                            dest='filename',
                            nargs='+')
    cli_parser.add_argument('-p', '--plan',
                            help='Name of the plan to be inspected',
                            dest='planname',
                            nargs='+')
    cli_parser.add_argument('-v', '--vm',
                            help='List of VMs used in the plan or single VM if no plan to be inspected',
                            dest='vmname',
                            nargs='+')
    cli_parser.add_argument('--hook',
                            help='This key should be used if hook usage is expected',
                            dest='hook',
                            nargs='+')
    return cli_parser
