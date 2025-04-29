##level temperature.py
"""buddy
Okay, you are ready to some real work.
Check if this code is easy to understand.
"""
##wisdoms no-abbr sign-is-doc

def fmt_temp(idx, tt):
    dnms = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return "Temperature for " + dnms[idx] + " is " + str(tt) + "° C"
##replace-span - idx day_of_week
##explain "Argument name is a part of code documentation. It is important to make it meaningful"
##hint $sign-is-doc
##replace-span - tt temperature
##explain $no-abbr
##hint $sign-is-doc
##replace-span - "dnms" "day_names"
##explain "Vowels are happy now!"
##hint "Do you wnt hnts? yrwlcm!"
##replace-span - fmt_temp format_temperature
##explain "Is temp for temporary?"
##hint $sign-is-doc
##end

print(fmt_temp(5, 20))
