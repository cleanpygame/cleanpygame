##file search.py
"""start
Wait a minute... didn't we just fix a 'contains' function in another file? 

Oh, I see what happened. Your colleague fixed the bug in the previous version but still didn't realize that Python has this magical thing called the 'in' operator. It's like they fixed a leaky boat with duct tape when there was a perfectly good yacht available!

Let's put this poor function out of its misery once and for all.
"""
##start-reply "Time to use Python's built-in features!"

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
##explain "Five lines of code versus one! This is like writing your own sorting algorithm when Python has sort() built in. The 'in' operator is not only more concise but also optimized for performance. Work smarter, not harder - that's the Python way!"
##hint "Python has a built-in operator specifically designed to check if one string contains another. No loops required!"
"""final
Perfect! You've replaced a manual string search algorithm with Python's built-in 'in' operator.

This is a classic example of "Pythonic" code - using the language's built-in features instead of reinventing them. The 'in' operator is:
1. More concise (1 line vs. 5)
2. More readable (the intent is immediately clear)
3. Likely more efficient (it's implemented in C)
4. Less prone to bugs (no off-by-one errors or edge cases to worry about)

Remember: Before implementing any common operation, check if Python already has a built-in way to do it. Chances are, it does!
"""
##final-reply "Built-in operators FTW!"
