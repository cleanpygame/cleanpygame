##file dot_product.py
"""start
Rumour has it this function was ported from punch-card code in Fortran.
"""
##start-reply "Hold my coffee!"

def dot_product(a, b):
    result = 0
##replace - "i in range"
    for i in range(len(a)):
        result += a[i] * b[i]
    return result
##with
    for x, y in zip(a, b):
        result += x * y
    return result
##end
##hint "Two lists walk into a bar… together."
##explain "Avoid indexes! Use zip for parallel iteration."
##option good good "Use 'zip'"
##option bad bad-1 "Use 'filter'"
##option bad bad-2 "Use 'fold'"
##replace-span - a vector1
##hint a?
##explain "Single letters in the function signature?"
##replace-span - b vector2
##hint b?
##explain "dot_product of two vectors. Not it is perfectly clear!"
"""final
Much cleaner now! But not enough...
"""
##final-reply "Not enough?!"
