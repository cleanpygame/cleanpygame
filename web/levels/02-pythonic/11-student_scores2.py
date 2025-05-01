##file student_scores2.py
"""start
Maybe one more little fix
"""
def analyze_scores(student_scores):
##replace - "for name, scores in student_scores"
    result = {}
    for name, scores in student_scores:
        avg = sum(scores) / len(scores)
        result[name] = avg
##with
    result = {
        name: sum(scores) / len(scores)
        for name, scores in data
    }
##end
##explain "This loop just builds a dictionary. A comprehension does the same job with less ceremony and more clarity."
##hint "Loops are COMPREHENSIVE! :winking:"
    for name in sorted(result):
        avg = result[name]
        print(f"{name}: {round(avg, 2)}")

    top, top_score = max(result.items(), key=lambda item: item[1])
    print(f"Top student is {top} with score {top_score}")

"""final
No more index wrangling, no more glue gun print statements,
and no more DIY loops. You turned clunky code into a clean, declarative joyride.
"""
##final-reply "I'm Pythonic guru!"