##level views.py
"""buddy
Do not change any constants here! They are magically calculated.
Nobody knows how, but everything works perfectly.
"""

def get_views_per_second(views, date):
##add-on MAGIC
    n = 24 * 60 * 60
##end
    daily_views = sum(1 for v in views if v.date == date)
    return daily_views / 86400

##replace-span - 86400 (24*60*60)
##explain "Magic numbers make code harder to understand"
##hint "What does this number represent?"
##replace-span MAGIC (24*60*60) n
##explain "Constant should have name"
##hint "Why stop here?!"
##replace-span - n seconds_in_24h
##explain "Variable names should be descriptive"
##hint "What does this variable represent?"
