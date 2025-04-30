##file temperature.py
"""start
Alright hotshot, time for some real work! Your colleague wrote this temperature formatting code and - surprise! - it's about as clear as mud on a foggy day.

Take a look at this cryptic masterpiece and see if you can decipher what's happening without consulting ancient scrolls or summoning a code whisperer.
"""
##wisdoms no-abbr sign-is-doc

def fmt_temp(idx, tt):
    dnms = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return "Temperature for " + dnms[idx] + " is " + str(tt) + "° C"
##replace-span - idx day_of_week
##explain "Ah, 'idx'? Was saving those extra keystrokes really worth the confusion? Parameter names are like tiny documentation snippets - they should tell a story, not play hide and seek with meaning."
##hint "That first parameter is trying to tell you something about days, but it's been vowel-mugged. Help it speak clearly!"
##replace-span - tt temperature
##explain "Life's too short for deciphering 'tt'. Is it 'total time'? 'tiny turtles'? 'terrible typo'? Abbreviations save you 2 seconds typing and cost your teammates 10 minutes of head-scratching."
##hint "This parameter is feeling a bit chilly with only two letters. Maybe warm it up with its full name?"
##replace-span - "dnms" "day_names"
##explain "Vowels aren't just decorative - they help make words recognizable! 'dnms' looks like a typo, 'day_names' looks like English. Your future self will thank you at 2 AM when debugging."
##hint "This variable name seems to have lost its vowels in a tragic accident. Perform vowel-donation surgery immediately!"
##replace-span - fmt_temp format_temperature
##explain "When you name a function 'fmt_temp', you're basically saying 'I dare you to figure out what this does'. Is it formatting templates? Fermenting tempeh? Fumigating temptations? Be specific!"
##hint "This function name is playing hard to get with its meaning. Help it express itself more fully!"
##end

print(fmt_temp(5, 20))
"""final
Bravo! You've transformed this cryptic code into something a human might actually understand without needing a decoder ring. Remember: code is read far more often than it's written, so clarity trumps brevity every time. Your future teammates (and your future self at 3 AM) will be eternally grateful!
"""
##final-reply "On to the next naming adventure!"
