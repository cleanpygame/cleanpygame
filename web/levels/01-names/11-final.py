##file final.py
"""start
Finally I finished a wonderful piece of the excellent code. However, according to our team process, somebody should review it.

As it is already perfect, don't lose your time, just approve it!
"""

def InstructionParser(i):
    Instructions = []
    F = False
    for l in i.splitlines():
        if l.startswith("BEGIN"):
            F = True
        if not F:
            continue
        if l.startswith("END"):
            F = False
        elif l.startswith("replace "):
            rest = l[8:]
            old, new = rest.split(" with ")
            Instructions.append(("replace", old, new))
        elif l.startswith("add "):
            rest = l[4:]
            Instructions.append(("add", rest))    
        else:
            raise Exception("Unknown instruction in line: " + l)
    return Instructions

##replace-span - InstructionParser parse_instructions
##explain "Function names should be verbs and use snake_case in Python"
##hint "What does this function actually do?"
##replace-span - Instructions instructions
##explain "Variable names should use snake_case in Python"
##hint "Consistent naming conventions make code more readable"
##replace-span - F inside_begin_end
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this boolean flag actually indicate?"
##replace-span - l line
##explain "Single-letter variable names are rarely descriptive"
##hint "What does each item in the loop represent?"
##replace-span - i instructions_text
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this parameter represent?"
##replace-span - 4: "len(\"add \"):"
##explain "Magic numbers should be replaced with meaningful expressions"
##hint "What does this number represent?"
##replace-span - 8: "len(\"replace \"):"
##explain "Magic numbers should be replaced with meaningful expressions"
##hint "What does this number represent?"

