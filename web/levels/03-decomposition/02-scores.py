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
##hint "We just put score value in certain bound..."
##explain "Sometimes you extract function not because of duplication!"
##option bad bad-0 "Find built-in function"
##option good good "Extract function"
    return res

def process_exam_scores(raw_scores):
    math_scores = clamp_scores(raw_scores['math'])
    science_scores = clamp_scores(raw_scores['science'])
    history_scores = clamp_scores(raw_scores['history'])
    # ...
##replace-span - clamp_score clamp
##hint "Not only scores deserves to be clamped!"
##explain "Nothing special in scores. Any number can be clamped"
##option bad bad-1 "Rename to 'clamp_value'"
##option good good "Rename to 'clamp'"
##replace-span - score_val value
##hint "What is so special in scores?"
##explain "Yes, not just score — any value goes!"
"""final
No we can move this clamp function to our math library and use it everywhere!

BTW, are you finished here?
"""
##final-reply "Not yet!"
