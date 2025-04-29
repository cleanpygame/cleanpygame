##level csv_processing.py
"""
Meh... for, for, for... For what?!
"""
def list_to_csv(nums):
##replace csv_join
    csv = ""
    for n in nums:
        csv += str(n) + ","
    if csv.endswith(","):
        csv = csv[:-1]
    return csv
##with
    return ",".join(str(n) for n in nums)
##end
##explain "Use string join with generator expression instead of manual concatenation"
##hint "String concatenation in loops is inefficient"

def count_zeros(values):
##replace count_zeros
    count = 0
    for v in values:
        if v == 0:
            count += 1
    return count
##with
    return sum(1 for v in values if v == 0)
##end
##explain "Generator expressions — a powerful tool for counting"
##hint "Generator expressions. Heard of them?"

def uppercase_file(filename):
##replace with_open
    file_obj = open(filename, 'r', encoding='utf-8')
    big_text = file_obj.read().upper()
    file_obj.close()
    return big_text
##with
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read().upper()
##end
##explain "Use `with` for file operations to ensure proper closure"
##hint "what if an error occurs?"






