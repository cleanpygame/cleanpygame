##file cells.py
"""start
Well done on your previous fixes! Now your colleague has sent you this "masterpiece" of clarity. 

"It's short and simple," they said. "Probably doesn't need any changes," they said. Let's see about that... I spy with my little eye some variables that are playing hide-and-seek with their meanings!
"""
def get(lst):
    lst1 = []
    for c in lst:
        if c.is_empty: 
            lst1.append(c.position)
    return lst1

lst = read_cells("cells.csv")
print(get(lst))

##replace-span - get get_empty_positions
##hint "Is the function's purpose immediately clear from its name?"
##explain "Perfect! A function's name should explain its purpose. We're not playing charades here."
##option bad bad-2 "Add comment for function"
##option good good "Rename to 'get_empty_positions'"
##option bad bad-1 "Rename to 'find_empty_data'"
##replace-span - lst1 empty_positions
##hint "Does that name clearly tell you what kind of data it holds?"
##explain "Ah, 'lst1', the pinnacle of descriptive naming! Now, 'empty_positions' actually tells us what it holds. Much clearer, isn't it?"
##option bad bad-1 "Rename to 'result_list'"
##option good good "Rename to 'empty_positions'"
##option bad bad-2 "Rename to 'filtered_cells'"
##replace-span - lst cells
##hint "Does this name clearly tell you what kind of items are inside?"
##explain "Calling a list 'lst' is like calling your dog 'animal'. 'Cells' tells you exactly what you're dealing with. Much clearer, right?"
##option bad bad-1 "Rename to 'items'"
##option good good "Rename to 'cells'"
##option bad bad-2 "Explain in a comment"
##replace-span - c cell
##hint "Does that single letter really tell you what it is?"
##explain "Using single letters is great for puzzles, but terrible for code. Now 'cell' actually tells us what it is!"
##option good good "Rename to 'cell'"
##option bad bad-1 "Rename to 'item'"
"""final
Excellent work! You've transformed this cryptic code into something self-documenting.
Now anyone reading it can understand what it does without having to trace through the execution in their head.
Remember: code is written once but read many times, so optimizing for readability is always worth the extra keystrokes!
"""
##final-reply "Next challenge!"
