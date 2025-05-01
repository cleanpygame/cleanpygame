##file bag_of_words.py
"""start
Grab your hazmat suit, Junior — this function comes with its own built-in foot-guns:
Click fast before someone deploys it to production Slack bots.
"""
##start-reply "Deploy the fixes!"

def bag_of_words(text, stop_words=[]):
##add-on md
    if stop_words is None:
        stop_words = []
##end
    words = text.lower().split()
    dict = {}
##replace loop "i in range"
    for i in range(len(words)):
        word = words[i]
##with
    for word in words:
##end
##explain "range(len()) is a 1990s dance move. Loop directly and stay readable."
##hint "Drop the index juggling act."
        if word in stop_words:
            continue
        if word in dict:
            dict[word] += 1
        else:
            dict[word] = 1
##replace
    result = []
    for k in dict.keys():
        result.append((k, dict[k]))
    return result
##with
    return list(dict.items())
##end
##replace-span md "stop_words=[]" "stop_words=None"
##explain "Mutable defaults are time bombs. Much safer to avoid them totally"
##hint "Look carefully at the first line!"
##replace-span rename "dict" "frequencies"
##explain "Shadowing built-ins starts turf wars. Give the poor 'dict' its name back."
##hint "Why pick a fight with a core type?"
"""final
Boom! No more shared stop-word ghosts, no more hijacked 'dict', and the loop finally speaks Python.
Remember: safe defaults, respect the built-ins, and iterate like a local — your future self will thank you.
"""
##final-reply "Clean and counting!"
