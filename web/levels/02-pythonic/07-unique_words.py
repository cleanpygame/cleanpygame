##file unique_words.py
"""start
Déjà-vu detection gone rogue!
Because the function’s default `set()` is shared across calls, words remembered from round #1 vanish in round #2.
Let’s stop that silent memory leak before it confuses the next intern.
"""
##start-reply "Let’s make it truly unique!"

def unique_words(text, seen=set()):
    """Return unique words we haven't seen before (case-insensitive)."""
##add-on md
    if seen is None:
        seen = set()
##end
    words = text.lower().split()
    for word in words:
        if list(seen).count(word) == 0:
            seen.add(word)
            yield word

##replace-span - "list(seen).count(word) == 0" "not (word in seen)"
##replace-span - "not (word in seen)" "word not in seen"
##replace-span md "seen=set()" "seen=None"
##explain "Default arguments are evaluated once — so this cheerful little `set()` is shared across *every* call. Like a clingy ex, it never forgets."
##hint "If your function remembers things you didn't tell it to… it's haunted."
"""final
Now that we’ve exorcised the memory-leaking default,
`unique_words` behaves like a normal function — not a long-term surveillance device.
Fresh state per call, zero ghosts in the machine.
Pythonic and private, just the way we like it.
"""
##final-reply "Fresh every time!"
