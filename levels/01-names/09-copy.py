##level copy.py
"""
Huh, somebody wrote documentation for their code?! Weakling! Real coders don't read or write docs. They read and write CODE!
"""

def copy(xs, ys, j, k, n):
    """Copy elements from ys to xs

    Args:
        xs - destination
        ys - source
        j - start index in xs
        k - start index in ys
        n - number of elements to copy
    """
    for i in range(n):
        xs[j+i] = ys[k+i]

##replace-span - xs destination
##explain "Variable names should be descriptive"
##hint "What does this parameter represent?"
##replace-span - ys source
##explain "Variable names should be descriptive"
##hint "What does this parameter represent?"
##replace-span - j dest_start
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this parameter represent?"
##replace-span - k src_start
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this parameter represent?"
##replace-span - n count
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this parameter represent?"
