##file search.py
"""start
Wait a minute... didn't we just fix a 'contains' function in another file? 

Oh, I see what happened. Your colleague fixed the bug in the previous version but still didn't realize that Python has this magical thing called the 'in' operator. It's like they fixed a leaky boat with duct tape when there was a perfectly good yacht available!

Let's put this poor function out of its misery once and for all.
"""
##start-reply "Use built-ins!"

def contains(text, pattern):
##replace
    pattern_len = len(pattern)
    for i in range(len(text)):
        if text[i:i+pattern_len] == pattern:
            return True
    return False
##with
    # Do we really need this function?!
    return pattern in text
##end
##hint "Python has a built-in way to check string containment. No loops needed!"
##explain "Why reinvent the wheel? The 'in' operator is concise, optimized, and already built-in."
##option bad bad-0 "Use generator"
##option good good "Use 'in' operator"
##option bad bad-1 "Use list comprehensions"
##option bad bad-2 "Use text.find()"
"""final
Perfect! You've replaced a manual algorithm with Python's built-in 'in' operator.

This is classic Pythonic code - using built-in features instead of reinventing them. The 'in' operator is concise, readable, efficient, and less error-prone.
"""
##final-reply "Built-in operators FTW!"
