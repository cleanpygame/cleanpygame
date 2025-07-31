##file scores.py
"""start
Welcome back, Junior! Today's code review is from our intern who seems to have a copy-paste addiction.

It seems, he forces us to use copy-paste a lot in our code review notes!
"""
##start-reply "Oh... Interns..."
##add-on block1 block2 block3
def some_duplication(scores):
    res = []
    for score in scores:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        res.append(score)
    return res
##end
##replace-span - some_duplication clamp_scores
##explain "Okay, now it's finally clear what this function is"
##hint "Time to get rid of temporary names!"

def process_exam_scores(raw_scores):
##replace block1
    math_scores = []
    for score in raw_scores['math']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        math_scores.append(score)
##with
    math_scores = some_duplication(raw_scores['math'])
##end
##explain "This code is duplicating!"
##hint "math... programmers don't need math!"
##replace block2
    science_scores = []
    for score in raw_scores['science']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        science_scores.append(score)
##with
    science_scores = some_duplication(raw_scores['science'])
##end
##explain "D-D-Duplication!"
##hint "science... the only science I like is Computer Science!"
##replace block3
    history_scores = []
    for score in raw_scores['history']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        history_scores.append(score)
##with
    history_scores = some_duplication(raw_scores['history'])
##end
##explain "DRY (Don't Repeat Yourself) isn't just about saving keystrokes - it's about having a single source of truth. Now if the normalization logic changes, you only need to update it in one place!"
##hint "I hope they mean git history?"
    # ...
"""final
Good start! What is next?
"""
##final-reply "Next?!"
