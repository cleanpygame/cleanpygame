##file report_errors.py
"""start
This function works... but feels like it time-traveled from 2002.
Let’s give it a Pythonic glow-up!
"""
##start-reply "Hold my semicolon"

def report_errors(lines):
##replace
    for i in range(len(lines)):
        line = lines[i]
##with
    for i, line in enumerate(lines):
##end
##explain "Manual indexing is fragile and clunky. `enumerate()` gives you the index and the item in one clean shot."
##hint "Let Python count for you — it’s good at it."
        if "ERROR" in line:
##replace - "Line \" + str(i + 1) + \": \" + line"
            print("Line " + str(i + 1) + ": " + line)
##with
            print(f"Line {i+1}: {line}")
##end
##explain "f-strings are faster, cleaner, and easier to read than string concatenation."
##hint "Why concatenate when you can interpolate?"
"""final
P-p-p... Pythonic!
"""
##final-reply "Formatted and fabulous."