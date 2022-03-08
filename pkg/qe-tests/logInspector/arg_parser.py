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
                            help='',
                            dest='planname',
                            nargs='+')
    cli_parser.add_argument('-v', '--vm',
                            help='',
                            dest='vmname',
                            nargs='+')
    return cli_parser
