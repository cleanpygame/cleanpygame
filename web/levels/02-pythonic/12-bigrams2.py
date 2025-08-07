##file bigrams.py
"""start
Bigrams? Again?! Ok, is it even possible to improve this code any more?
"""
##start-reply "Hm... I'll try!"
##add-on counter
from collections import Counter

##end
def get_bigrams_frequency(words):
##replace counter {}
    counter = {}
##with
    counter = Counter()
##end
##hint "Are you sure you need to manually count items like this?"
##explain "Great, you found `Counter`! I was worried you were about to reinvent the whole standard library."
##option good good "Use `Counter`"
##option bad bad-1 "Use `Frequencies`"
##option bad bad-2 "Initialize with `None`"
    for i in range(len(words) - 1):
        bigram = f"{words[i]} {words[i + 1]}"
##replace-on counter
        if bigram in bigrams_frequency:
            counter[bigram] += 1
        else:
            counter[bigram] = 1
##with
        counter[bigram] += 1
##end
    return counter
"""final
Using `Counter` made the code shorter!
"""
##final-reply "COUNTED!"
