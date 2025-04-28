##level contains.py
"""
Uhh.. Can't find a bug here... Can you help me a little?
"""

def contains(text, pattern):
    l = len(pattern)
    for i in range(len(text)):
        if text[i:i+1] == pattern:
            return True
    return False

# Hint for the future: never use lowercase 'l' as a variable name!

##replace-span - l pattern_len
##explain "Avoid using lowercase 'l' as a variable name as it can be confused with the number '1'"
##hint "What does this variable represent?"
##replace-span - i+1 i+l
##explain "This is a bug! We need to use the pattern length, not just 1 character"
##hint "How many characters should we compare?"
