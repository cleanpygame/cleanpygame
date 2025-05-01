##file temperature.py
"""start
Time for some real work! Take a look at this cryptic masterpiece of your colleague and see if you can decipher what's happening without consulting ancient scrolls or summoning a code whisperer.
Let's make this readable for mere mortals.
"""
##wisdoms no-abbr sign-is-doc

def fmt_temp(idx, tt):
    dnms = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return "Temperature for " + dnms[idx] + " is " + str(tt) + "° C"
##replace-span - idx day_of_week
##explain "Parameter names should tell a story, not play hide and seek with meaning. 'idx' saves keystrokes but costs clarity."
##hint "Index of what?!"
##replace-span - tt temperature
##explain "Abbreviations save seconds typing but cost minutes of confusion. What does 'tt' even mean?"
##hint "Imagine that names are the only documentation on this function you have..."
##replace-span - "dnms" "day_names"
##explain "Vowels aren't just decorative - they make words recognizable! 'dnms' looks like a typo."
##hint "Variable lost its vowels. Perform vowel-donation surgery!"
##replace-span - fmt_temp format_temperature
##explain "'fmt_temp' could mean anything from formatting templates to fermenting tempeh."
##hint "Imagine that function name is the only documentation on this function you have..."
##end

print(fmt_temp(5, 20))
"""final
Bravo! Now human might actually understand without needing a decoder ring.
Remember: code is read far more often than it's written, so clarity trumps brevity every time. Your future teammates (and your future self at 3 AM) will be eternally grateful!
"""
##final-reply "Next naming task!"
