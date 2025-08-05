##file student_scores.py
"""start
This code technically works... but so does assembling IKEA furniture with your forehead.
Manual indexing, verbose accumulation, and enough string glue to open a kindergarten.
Let’s apply some Pythonic polish before someone copy-pastes this into production.
"""
##start-reply "Sharpening the scalpel..."
def analyze_scores(data):
    result = {}
##replace - "for i in range(0, len(data))"
    for i in range(0, len(data)):
        name = data[i][0]
        scores = data[i][1]
##with
    for name, scores in data:
##end
##hint Indices?
##explain "No indices! Let the data tell the story, not the loop counter."
##option good good "Unpack data directly in loop"
##option bad bad-1 "Use enumerate for index"
##option bad bad-3 "Convert to dictionary first"
##replace loop "for j in range(0, len(scores))"
        total = 0
        for j in range(0, len(scores)):
            total = total + scores[j]
##with
##end
##hint "Built-ins... Remember them?"
##explain "Let Python do the math."
##option bad bad-0 "Rename total"
##option good good "Use sum() for scores"
##option bad bad-3 "Use enumerable"
##replace-on loop
        avg = total / len(scores)
##with
        avg = sum(scores) / len(scores)
##end
        result[name] = avg

##replace - "for i in range(0, len(keys))"
    keys = list(result.keys())
    keys.sort()
    for i in range(0, len(keys)):
        name = keys[i]
##with
    for name in sorted(result):
##end
##hint "Sorted loops don’t require pre-sorting the keys."
##explain "for name in `sorted(result)` and -3 lines of code."
##option bad bad-0 "Simplify range call"
##option bad bad-2 "Change data structure"
##option good good "Use 'sorted()' in for"
        avg = result[name]
##replace - "name + \": \" + str"
        print(name + ": " + str(round(avg, 2)))
##with
        print(f"{name}: {round(avg, 2)}")
##end
##hint "a, b, c, d, e, ... What's next?"
##explain "f-strings. Remember them?"

##replace - "for k in result:"
    top = None
    top_score = -1
    for k in result:
        if result[k] > top_score:
            top_score = result[k]
            top = k
##with
    top, top_score = max(result.items(), key=lambda item: item[1])
##end
##hint "Stop reinventing wheels!"
##explain "One more built-in! max(..., key=...) with lambda!"
##option good good "Use max() with lambda"
##option bad bad-2 "Inverse comparison"
##option bad bad-3 "Extract function"

##replace - "Top student is \" + top + \" with score \" + str(top_score)"
    print("Top student is " + top + " with score " + str(top_score))
##with
    print(f"Top student is {top} with score {top_score}")
##end
##hint "You’re better than chained string concatenation."
##explain "f-strings again — they handle variables and formatting gracefully."
##replace-span - data student_scores
##hint "data is everywhere!"
##explain "You say data, when you don't know what else to say"
##option good good "Rename to 'student_scores'"
##option bad bad-1 "Rename to 'player_scores'"
##option bad bad-2 "Rename to 'products'"
"""final
Now *that* looks like Python. Almost...
"""
##final-reply "Almost?!"
