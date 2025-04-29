##level sum.py
"""
Look at these goood ooold looops!
"""

def print_sum_and_min(values):
##replace sum_loop
    sum_all = 0
    for i in values:
        sum_all += i
##with
    sum_all = sum(values)
##end
##explain "Use built-in sum() function instead of manual loop"
##hint "Python has built-in functions for common operations"
##replace min_loop
    min_value = values[0]
    for v in values[1:]:
        if v < min_value:
            min_value = v
##with
    min_value = min(values)
##end
##explain "Use built-in min() function instead of manual loop"
##hint "Python has built-in functions for common operations"
    print(f"sum: {sum_all}, min: {min_value}")