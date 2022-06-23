from models.virtual_machine import Vm
from utils import download_file, unpack_file
from arg_parser import create_parser

# CRs check - compare oc get CR with the static parts of the yaml. Log that start with Forklift are gathered only for
# the lines that contain the PLAN/VM name - Search plan/VM name + number of logs lines > 5
# Importer log, conversion log - that are gathered fully - Compare all content/only first /end lines
from models.plan import Plan


def main():
    f_name = None
    test_passed = False
    parser = create_parser()
    args = parser.parse_args()
    hook_enabled = False
    if args.url:
        f_name = download_file(args.url[0])
    elif args.filename:
        f_name = args.filename[0]
    else:
        print('No valid archive was provided, aborting...')
        exit(-1)

    cont = unpack_file(f_name=f_name)

    if args.vmname:
        if args.planname:
            if args.hook:
                hook_enabled = True
                print('<<<---Looking for hook--->>>')
            plan = Plan(args.planname[0], cont)
            plan.first_init()
            for current_vm in args.vmname:
                plan.vm_list.append(Vm(current_vm, cont, hook_enabled))
            assert len(plan.vm_list) == len(args.vmname)
            plan.validate()
            if not plan.error_state:
                test_passed = True
        else:
            print('No plan was provided, only VM and DV will be inspected')
            vm = Vm(args.vmname[0], cont)
            vm.validate()
            if not vm.error_state:
                test_passed = True
    else:
        print('No VM names were provided, aborting...')
        exit(-1)

    if test_passed:
        print('PASSED')
    else:
        print('FAILED')


if __name__ == '__main__':
    main()
