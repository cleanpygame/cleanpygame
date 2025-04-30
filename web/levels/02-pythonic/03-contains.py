##file search.py
"""start
Stop... `contains` again?! Haven't we already done this?
"""

def contains(text, pattern):
##replace in_operator
    pattern_len = len(pattern)
    for i in range(len(text)):
        if text[i:i+pattern_len] == pattern:
            return True
    return False
##with
    # Do we really need this function?!
    return pattern in text
##end
##explain "Use Python's 'in' operator instead of manual search"
##hint "No need to invent the wheel"

