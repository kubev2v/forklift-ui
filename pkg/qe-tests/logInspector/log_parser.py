import re


def file_parser(filename, pattern):
    try:
        with open(filename) as f:
            line_counter = 0
            total_found = 0
            for line in f:
                line_counter += 1
                matches = re.findall(pattern, line)
                if matches:
                    total_found += 1
            return total_found, line_counter

    except IOError:
        print("File not found or can't be accessed:", filename)
        return None
