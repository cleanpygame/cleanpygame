##file dot_product2.py
"""start
Maybe one final fix...
"""

def dot_product(vector1, vector2):
##replace
    result = 0
    for x, y in zip(vector1, vector2):
        result += x * y
##with
    return sum(x*y for (x, y) in zip(vector1, vector2))
##end
##hint loop?
##explain "Often you can avoid not only indexes but also for loops!"
##option good good "Use 'sum'"
##option bad bad-1 "Use 'fold'"
##option bad bad-2 "Use 'enumerate'"
"""final
Perfect! `zip` pairs elements safely, reads like English,
and kicks index acrobatics to the curb.
"""
##final-reply "Zip-zap, done!"
##end_of_level

print(dot_product([1,2,3], [0, 1, 2])) # 8?