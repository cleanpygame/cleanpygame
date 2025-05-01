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
##explain "Often you can avoid not only indexes but also for loops!"
##hint "loop?"
"""final
Perfect! `zip` pairs elements safely, reads like English,
and kicks index acrobatics to the curb.
"""
##final-reply "Zip-zap, done!"
##end

print(dot_product([1,2,3], [0, 1, 2])) # 8?