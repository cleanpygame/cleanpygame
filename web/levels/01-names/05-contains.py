##file contains.py
"""start
Your colleague just pushed this "perfectly working" string search function to production. Customers are already complaining that the search doesn't work properly.

The developer swears there's no bug: "It compiles, doesn't it?" Can you find what's lurking in this seemingly innocent code before the support team stages a revolt?
"""
##start-reply "Challenge accepted!"

def contains(text, pattern):
    l = len(pattern)
    for i in range(len(text)):
        if text[i:i+1] == pattern:
            return True
    return False

##replace-span - l pattern_len
##explain "Lowercase 'l' as a variable name? Are you trying to confuse it with the number '1' and the uppercase 'I'? This is how debugging nightmares begin! Always use descriptive names that don't require a cryptography degree to decipher."
##hint "That variable name 'l' is playing a dangerous game of 'guess which character I am' with future developers. What information is it actually storing?"
##replace-span - i+1 i+l
##explain "Aha! The infamous off-by-everything bug! You're checking if a single character equals the entire pattern. That's like checking if a single brick is the same as an entire house. No wonder the search function wasn't working!"
##hint "The code is comparing a single character to the entire pattern. Shouldn't it be comparing the same number of characters as the pattern length?"
"""final
Excellent debugging! You've fixed both a naming issue AND a logical bug. The original code was only checking if any single character matched the entire pattern (which would only work for single-character patterns). Your fix ensures it compares the right number of characters. This is why naming variables clearly is so important - it makes bugs like this much easier to spot!
"""
##final-reply "Bug squashed! What's next?"
