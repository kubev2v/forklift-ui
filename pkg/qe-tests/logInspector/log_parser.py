import re


def file_parser(filename, pattern):
    try:
        with open(filename) as f:
            line_counter = 0
            total_found = 0
            # p = re.compile(pattern)
            # print(f.name)
            for line in f:
                line_counter += 1
                # line2 = ""
                matches = re.findall(pattern, line)
                if matches:
                    # print("File name: ", f.name, "; Line number: ", line_counter)
                    # print(line.strip('\n'))
                    total_found += 1
                # for m in p.finditer(line):
                #     cur_pointer = m.start()
                #     length = len(m.group())
                #     line2 = line2 + " " * (cur_pointer - len(line2)) + "^" * length
                # if line2 != "":
                #     print(line2)

            # print('Pattern:', pattern, '\nTotal times found:', total_found)
            return total_found, line_counter

    except IOError:
        print("File not found or can't be accessed:", filename)
        return None
