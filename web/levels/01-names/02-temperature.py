##file temperature.py
"""start
Oh! Time for some real work! Take a look at this cryptic masterpiece of your colleague and see if you can decipher what's happening without consulting ancient scrolls or summoning a code whisperer.
Let's make this readable for mere mortals.
"""
def fmt_temp(idx, tt):
    dnms = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return "Temperature for " + dnms[idx] + " is " + str(tt) + "° C"
##replace-span - idx day_of_week
##explain "Parameter names should tell a story, not play hide and seek with meaning. 'idx' saves keystrokes but costs clarity."
##hint "Index of what?!"
##option bad - Rename to 'index'
##option bad - Rename to 'day'
##option good - Rename to 'day_of_week'
##option bad - Rename to 'day_of_month'
##replace-span - tt temperature
##explain "Abbreviations save seconds typing but cost minutes of confusion. What does 'tt' even mean?"
##hint "Imagine that names are the only documentation on this function you have..."
##option good - Rename to temperature
##option bad - Rename to temp
##option bad - Rename to t
##replace-span - "dnms" "day_names"
##explain "Vowels aren't just decorative - they make words recognizable! 'dnms' looks like a typo."
##hint "Variable lost its vowels. Perform vowel-donation surgery!"
##option bad - Inline variable
##option good - Rename to day_names
##option bad - Rename to daynames
##replace-span - fmt_temp format_temperature
##explain "'fmt_temp' could mean anything from formatting templates to fermenting tempeh."
##hint "Imagine that function name is the only documentation on this function you have..."
##option bad - Rename to format_temperature_for_day_of_week
##option good - Rename to format_temperature
##option bad - Rename format
##option bad - Rename fmt


print(fmt_temp(5, 20))
"""final
Bravo! Now human might actually understand without needing a decoder ring.
Remember: code is read far more often than it's written, so clarity trumps brevity every time. Your future teammates (and your future self at 3 AM) will be eternally grateful!
"""
##final-reply "Next naming task!"