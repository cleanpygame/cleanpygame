##file discount.py
"""start
When you already have a variable called 'flag' and need another one, do you go with:
A) flag and flag2
B) flag and flag1
C) flag1 and flag2
D) Your option...

Our developer chose option A!
"""
##start-reply "Option D, obviously!"

def is_discount_hunter(customer):
    flag = True
    for order in customer.orders:
        flag2 = False
        for item in order.items:
            if item.product.discount > 0:
                flag2 = True
        flag = flag and flag2
    return flag

##replace-span - flag every_order_has_discounted_item
##explain "Flags are for countries! Only!"
##hint "if flag? or if not flag? always difficult to decide..."
##option good - "Rename to something with both 'every_order' and 'discount' in the name"
##option bad bad-2 "Rename to 'discounted'"
##option bad bad-1 "Rename to 'all_orders'"
##replace-span - flag2 has_discount
##explain "flag2? Is that the sequel to flag1? Coming soon to theaters near you! Numbered variables are like mystery boxes - exciting until you realize you have to open them to know what's inside."
##hint "flag2 = ...  or flag = ...?"
##option good - "Rename to 'has_discount'"
##option bad bad-2 "Rename to 'no_discount'"
"""final
No more boolean guessing game in the code!
Now anyone reading this function can understand its purpose at a glance: it checks if a customer only buys orders that contain at least one discounted item.
Descriptive variable names make code tell a story, not pose a riddle!
"""
##final-reply "ready_for_next_level = True"
