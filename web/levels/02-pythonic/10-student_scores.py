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
##explain "No indices! Let the data tell the story, not the loop counter."
##hint "Indices?"
##replace loop "for j in range(0, len(scores))"
        total = 0
        for j in range(0, len(scores)):
            total = total + scores[j]
##with
##end
##explain "Let Python do the math."
##hint "Built-ins... Remember them?"
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
##explain "for name in `sorted(result)` and -3 lines of code."
##hint "Sorted loops don’t require pre-sorting the keys."
        avg = result[name]
##replace - "name + \": \" + str"
        print(name + ": " + str(round(avg, 2)))
##with
        print(f"{name}: {round(avg, 2)}")
##end
##explain "f-strings. Remember them?"
##hint "a, b, c, d, e, ... What's next?"

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
##explain "One more built-in! `max(..., key=...)` with lambda!"
##hint "Stop reinventing wheels!"

##replace - "Top student is \" + top + \" with score \" + str(top_score)"
    print("Top student is " + top + " with score " + str(top_score))
##with
    print(f"Top student is {top} with score {top_score}")
##end
##explain "f-strings again — they handle variables and formatting gracefully."
##hint "You’re better than chained string concatenation."
##replace-span - data student_scores
##explain "You say data, when you don't know what else to say"
##hint "data is everywhere!"
"""final
Now *that* looks like Python. Almost...
"""
##final-reply "Almost?!"