##file scores_v3.py
"""start
Okay, what can you fix here?
"""
def clamp_scores(scores):
##replace -
    res = []
    for score in scores:
      res.append(clamp_score(score, 0, 100))
    return res
##with
    return [clamp_score(score, 0, 100) for score in scores]
##end
##explain "List comprehensions are faster, cleaner, and easier to read than loops."
##hint "Loops are for the weak!"

def process_exam_scores(raw_scores):
##replace -
    math_scores = clamp_scores(raw_scores['math'])
    science_scores = clamp_scores(raw_scores['science'])
    history_scores = clamp_scores(raw_scores['history'])

    add_to_report('math', math_scores)
    add_to_report('science', science_scores)
    add_to_report('history', history_scores)
##with
    for subject in ['math', 'science', 'history']:
        subject_scores = clamp_scores(raw_scores[subject])
        add_to_report(subject, subject_scores)
##end
##explain "Join score processing and reporting into one operation and put it in a loop. Much cleaner now!"
##hint "Look, each topic is handled in the same way."
"""final
Wow, not an intern-looking-code anymore!
"""
##final-reply "I like it too, thanks!"
