##file contains.py
"""start
Your colleague just pushed this "perfectly working" string search function to production. Customers are already complaining that the search doesn't work properly.

Can you find what's lurking in this seemingly innocent code before the support team stages a revolt?
"""
##start-reply "Challenge accepted!"

def contains(text, pattern):
    l = len(pattern)
    for i in range(len(text)):
        if text[i:i+1] == pattern:
            return True
    return False

##replace-span - l pattern_len
##explain "Lowercase 'l' as a variable name? Good way to mess it with `1` and `I`!"
##hint "Single character name often are source of troubles!"
##replace-span - i+1 i+l
##explain "Off-by-many error? Is it a new level of the off-by-one?"
##hint "The slice is a bit... thin..."
"""final
Great debugging! You fixed both a naming issue and a logical bug. The original code only compared single characters to the entire pattern. Clear variable names make bugs like this easier to spot!
"""
##final-reply "Bug squashed! What's next?"
