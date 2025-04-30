##file discount.py
"""start
The Great Boolean Naming Dilemma of our time:

When you already have a variable called 'flag' and need another one, do you go with:
A) flag1 and flag2 (for that sequential thrill)
B) flag and flag_too (for the rhyming enthusiasts)
C) flag and THE_OTHER_FLAG (for shouting clarity)
D) Actually name them according to what they represent (but where's the mystery in that?)

Our developer chose option A. Let's see how that's working out...
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
##explain "Ah, the mysterious 'flag'! What does it represent? Peace? Surrender? The boolean 'every_order_has_discounted_item' actually tells us what we're tracking. Imagine if traffic lights were just labeled 'light1', 'light2', and 'light3' instead of red, yellow, and green!"
##hint "This variable is tracking something about ALL orders. What condition must be true for EVERY order to make this function return true?"
##replace-span - flag2 has_discount
##explain "flag2? Is that the sequel to flag1? Coming soon to theaters near you! Numbered variables are like mystery boxes - exciting until you realize you have to open them to know what's inside."
##hint "This inner flag is checking a property of each individual order. What specific condition about discounts is it verifying?"
"""final
Excellent! You've transformed this code from a boolean guessing game into something self-explanatory. Now anyone reading this function can understand its purpose at a glance: it checks if a customer only buys orders that contain at least one discounted item. Descriptive variable names make code tell a story, not pose a riddle!
"""
##final-reply "Boolean mystery solved! Next challenge!"
