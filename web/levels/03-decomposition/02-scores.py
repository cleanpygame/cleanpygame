##file scores_v2.py
"""start
I clearly can see some helpful primitive here, valuable not only for scores processing.
"""
##start-reply "Primitive?!"
##add-on clamp
def clamp_score(score_val, min_val, max_val):
  return min(max_val, max(min_val, score_val))

##end
def clamp_scores(scores):
    res = []
    for score in scores:
##replace clamp
      if score < 0:
        score = 0
      elif score > 100:
        score = 100
      res.append(score)
##with
      res.append(clamp_score(score, 0, 100))
##end
##explain "Sometimes you extract function not because of duplication!"
##hint "We just put score value in certain bound..."
    return res

def process_exam_scores(raw_scores):
    math_scores = clamp_scores(raw_scores['math'])
    science_scores = clamp_scores(raw_scores['science'])
    history_scores = clamp_scores(raw_scores['history'])
    # ...
##replace-span - clamp_score clamp
##explain "Nothing special in scores. Any number can be clamped"
##hint "Not only scores deserves to be clamped!"
##replace-span - score_val value
##explain "Yes, not just score — any value goes!"
##hint "What is so special in scores?"
"""final
No we can move this clamp function to our math library and use it everywhere!

BTW, are you finished here?
"""
##final-reply "Not yet!"
