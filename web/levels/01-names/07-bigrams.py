##file bigrams.py
"""start
Ah, the joys of cross-language developers! Anders and Nicolaus just transferred from the C# team and brought their naming conventions with them. They insist their style is "perfectly readable" and "who cares about PEP 8 anyway?"

Their code works, but it's like showing up to a Python conference wearing a tuxedo - technically dressed, but clearly missed the memo about the dress code. Can you help them blend in with the Python community?
"""
##start-reply "Time for a Python style makeover!"

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
##hint "This function name is dressed in CamelCase, but Python functions prefer to slither in snake_case."
##explain "CamelCase in Python? That's like wearing socks with sandals - technically functional but culturally questionable. Python has its own style guide (PEP 8) that recommends snake_case for functions. Consistency in style makes code more readable for the community."
##option good good "Rename to 'get_bigrams_frequency'"
##option bad bad-1 "Rename to 'getBigramsFrequency'"
##option bad bad-2 "Rename to 'getbigramsfrequency'"
##replace-span - bigramsCount bigrams_count
##hint "CamelCase in Python? That's cultural appropriation!"
##explain "Another CamelCase refugee! In Python, we separate our words with underscores, not capital letters. It's not just pedantry - consistent style makes code easier to scan and understand."
##option good good "Rename to 'bigrams_count'"
##option bad bad-1 "Rename to 'counts'"
##option bad bad-2 "Rename to 'bigrams'"
##replace-span - I i
##hint "Why is this loop counter SHOUTING at me?"
##explain "A capital 'I' as a loop counter? That's just asking to be confused with the number 1 in many fonts! Single-letter variables should be lowercase, especially common ones like loop counters."
##option good good "Rename to 'i'"
##option bad bad-1 "Rename to 'wordIndex'"
##replace-span - ws words
##hint "ws? Web Services? Weighted Sums? Wild Stallions?"
##explain "The mysterious 'ws'! Is it 'web services'? 'work sheets'? 'wild stallions'? Abbreviations save you 3 seconds typing and cost the next developer 3 minutes of confusion."
##option bad bad-1 "Rename to 'web_service'"
##option bad bad-2 "Rename to 'worksheet'"
##option good good "Rename to 'words'"
##replace-span - bg bigram
##hint "bg = Bulgaria? Background? Bill Gates? Buy Gold?"
##explain "'bg' could be 'background', 'bodyguard', or 'Bulgarian'. In a function specifically about bigrams, using the full term 'bigram' makes the code instantly more readable."
##option bad bad-1 "Rename to 'bug'"
##option good good "Rename to 'bigram'"
##option bad bad-2 "Rename to 'backgram'"
##replace-span - bigramsfrequency bigrams_frequency
##hint "This name needs some snake_case surgery. Stat!"
##explain "This variable name is having an identity crisis - it can't decide if it wants to be camelCase or snake_case, so it chose neither! Consistency in naming style makes code much easier to read."
##option good good "Rename to 'bigrams_frequency'"
##option bad bad-1 "Rename to 'bi_grams_frequency'"
##option bad bad-2 "Rename to 'bigramsFrequency'"
"""final
Excellent work! You've successfully converted this code to follow Python's naming conventions. While the code would work either way, following the established style guidelines for a language makes your code more readable and maintainable for other Python developers. It's like learning the local customs when you visit a new country - it shows respect for the community and helps you integrate better!
"""
##final-reply "Style guide conformance achieved!"
