##level bigrams.py
"""buddy
Anders and Nicolaus wrote this code. Their naming style is a little bit non typical for python...
"""

def GetBigramsFrequency(ws):
    bigramsCount = len(ws) - 1
    bigramsfrequency = {}
    for I in range(bigramsCount):
        bg = ws[I] + ' ' + ws[I + 1]
        if bg in bigramsfrequency:
            bigramsfrequency[bg] += 1
        else:
            bigramsfrequency[bg] = 1
    return bigramsfrequency

##replace-span - GetBigramsFrequency get_bigrams_frequency
##explain "Python functions should use snake_case naming style"
##hint "Function names in Python should be lowercase with underscores"
##replace-span - bigramsCount bigrams_count
##explain "Python variables should use snake_case naming style"
##hint "Variable names in Python should be lowercase with underscores"
##replace-span - I i
##explain "Single-letter variables should be lowercase"
##hint "Loop counters are typically lowercase"
##replace-span - ws words
##explain "Variable names should be descriptive"
##hint "What does this parameter represent?"
##replace-span - bg bigram
##explain "Avoid abbreviations unless they are well-known"
##hint "What does this variable represent?"
##replace-span - bigramsfrequency bigrams_frequency
##explain "Python variables should use snake_case naming style"
##hint "Variable names in Python should be lowercase with underscores"
