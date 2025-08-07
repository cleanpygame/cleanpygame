##file sum.py
"""start
Ah, I see your colleague is a fan of "artisanal, hand-crafted loops" - painstakingly constructing each calculation from scratch like it's 1995!

They probably also churn their own butter and forge their own paperclips. Let's introduce them to revolutionary concept of "built-in functions" that Python has had since... forever.
"""
##start-reply "Let's modernize!"

def print_sum_and_min(values):
##replace sum
    sum_all = 0
    for i in values:
        sum_all += i
##with
    sum_all = sum(values)
##end
##hint "What for do we use 'for' here?"
##explain "Python's sum() is faster and less error-prone."
##option bad bad-0 "Use while loop"
##option good good "Use built-in function"
##option bad bad-2 "Rename 'i'"
##replace min
    min_value = values[0]
    for v in values[1:]:
        if v < min_value:
            min_value = v
##with
    min_value = min(values)
##end
##hint "Finding minimums manually? What is this, the stone age?"
##explain "Python's min() is safer and cleaner."
##option bad bad-0 "Explain the code in comments"
##option bad bad-1 "Add else-clause"
##option good good "Use built-in function"
    print(f"sum: {sum_all}, min: {min_value}")
"""final
Excellent! Pythonic code!

Python's built-in functions make your code more readable, concise, and often faster.
Remember: "Flat is better than nested" and "Simple is better than complex" - core principles from the Zen of Python.
"""
##final-reply "Built-ins for the win!"
