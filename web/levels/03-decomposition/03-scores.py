##file scores_v3.py
"""start
Okay, what can you fix here?
"""
def clamp(val, min_val, max_val):
  return min(max_val, max(min_val, val))

def clamp_scores(scores):
##replace
    res = []
    for score in scores:
      res.append(clamp(score, 0, 100))
    return res
##with
    return [clamp(score, 0, 100) for score in scores]
##end
##hint "Loops are for the weak!"
##explain "List comprehensions are faster, cleaner, and easier to read than loops."
##option good good "Use list comprehension"
##option bad bad-2 "Extract to new function"

def process_exam_scores(raw_scores):
##replace
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
##hint "Look, each topic is handled in the same way."
##explain "Join score processing and reporting into one operation and put it in a loop. Much cleaner now!"
##option bad bad-0 "Reorder statemtns"
##option good good "Loop all subjects"
##option bad bad-2 "Extract function"
"""final
Wow, not an intern-looking-code anymore!
"""
##final-reply "I like it too, thanks!"
