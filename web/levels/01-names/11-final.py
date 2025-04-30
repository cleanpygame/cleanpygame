##file final.py
"""start
BEHOLD! I have crafted the most exquisite piece of code known to humanity! It's so perfect that it probably doesn't even need electricity to run - the sheer elegance of its logic could power a small city.

According to our tedious team process, someone needs to review it. But let's be honest - this is just a formality. Simply approve it and we can all go home early!

(Narrator: It was not, in fact, perfect.)
"""
##start-reply "Let me review this 'perfect' code..."

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
##explain "CamelCase function names in Python? That's like wearing a tuxedo to a beach party. Python has its own dress code (PEP 8), and it strongly recommends snake_case for functions. Also, functions should be verbs because they DO things - they're not just sitting around being nouns."
##hint "This function is taking some text and converting it into structured data. What action is it performing on the instructions?"
##replace-span - Instructions instructions
##explain "Why is 'Instructions' capitalized? Is it royalty? A proper noun? The beginning of a sentence? In Python, variable names should be snake_case and lowercase unless they're constants (which this definitely isn't)."
##hint "This variable is breaking Python's naming convention. How would you write this in lowercase with the proper Python style?"
##replace-span - F inside_begin_end
##explain "Ah, the enigmatic 'F'! Is it paying respects? A grade? The sixth letter of the alphabet? Single-letter variables are like secret codes that only the original developer understands - and sometimes not even them after a few months."
##hint "This boolean is tracking whether we're currently between specific markers in the text. What state is it actually representing?"
##replace-span - l line
##explain "The letter 'l' is particularly problematic as a variable name because in many fonts it looks identical to the number '1'. It's like setting a trap for the next developer (or yourself in 3 months)."
##hint "This loop is iterating through something line by line. What exactly does each 'l' represent?"
##replace-span - i instructions_text
##explain "The lonely 'i' parameter! Is it an index? An iterator? An imaginary number? When parameters are the entry point to your function, they deserve names that clearly explain what they contain."
##hint "This parameter contains the raw text that needs to be parsed. What would be a more descriptive name?"
##replace-span - 4: "len(\"add \"):"
##explain "Magic numbers like '4' are like mysterious ingredients in a recipe. 'Add a pinch of 4' - but why 4? What does it represent? Using 'len(\"add \")' makes it immediately clear you're skipping past a command prefix."
##hint "This number represents the length of a specific command prefix. How could you make that explicit in the code?"
##replace-span - 8: "len(\"replace \"):"
##explain "Another magic number! '8' is the lucky number in some cultures, but in code, unexplained numbers are just bad luck waiting to happen. What if the command syntax changes? You'd have to hunt down all these hardcoded values."
##hint "Similar to the previous issue, this number is the length of a command string. How could you calculate this dynamically?"
"""final
Congratulations! You've transformed this "perfect" code into something actually worthy of approval. 

You've applied all the naming best practices we've covered:
1. Using snake_case for Python functions and variables
2. Making function names verbs that describe their action
3. Using descriptive names instead of single letters or abbreviations
4. Replacing magic numbers with self-documenting expressions

Remember: Code isn't just for computers to execute - it's for humans to read, understand, and maintain. Good naming is the foundation of readable code, and readable code is the foundation of maintainable software.

You've completed the naming challenges! Your future teammates thank you in advance for your clear, descriptive naming practices.
"""
##final-reply "From 'perfect' to actually good!"
