##file cells.py
"""start
Nice work! After your fixes code becomes much more readable. 
And this piece of code is really short and simple.
Not sure if it needs any changes.
"""
def get(lst):
    lst1 = []
    for c in lst:
        if c.is_empty: 
            lst1.Add(c.position)
    return lst1

lst = read_cells("cells.csv")
print(get(lst))

##replace-span - get get_empty_positions
##explain "Function name should describe what it does"
##hint "What does this function actually return?"
##replace-span - lst1 empty_positions
##explain "Use descriptive variable names"
##hint "What does this list store?"
##replace-span - lst cells
##explain "Use descriptive variable names"
##hint "What does this list contain?"
##replace-span - c cell
##explain "Single-letter variable names are rarely descriptive"
##hint "What does each item in the list represent?"

