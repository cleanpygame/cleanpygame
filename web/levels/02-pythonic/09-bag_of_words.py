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
##replace - "i in range"
    for i in range(len(words)):
        word = words[i]
##with
    for word in words:
##end
##hint "Drop the index juggling act."
##explain "range(len()) is a 1990s dance move. Loop directly and stay readable."
##option bad bad-0 "Use a while loop"
##option good good "Stop using indexes"
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
##option bad bad-1 "Use list comprehensions"
##option good good "Use dict.items()"
##option bad bad-3 "Use a default dictionary"
##replace-span md stop_words=[] stop_words=None
##hint "Look carefully at the first line!"
##explain "Mutable defaults are time bombs. Much safer to avoid them totally"
##option bad bad-0 "Rename porameter"
##option good good "Use None as default value"
##option bad bad-2 "Use {} as default value"
##replace-span - dict frequencies
##hint "Why pick a fight with a core type?"
##explain "Shadowing built-ins starts turf wars. Give the poor 'dict' its name back."
##option bad bad-0 "Rename to 'd'"
##option good good "Rename to 'frequencies'"
##option bad bad-3 "Rename to 'word_len'"
"""final
Boom! No more shared stop-word ghosts, no more hijacked 'dict', and the loop finally speaks Python.
Remember: safe defaults, respect the built-ins, and iterate like a local — your future self will thank you.
"""
##final-reply "Clean and counting!"
