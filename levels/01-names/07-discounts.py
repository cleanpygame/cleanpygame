##level discount.py
"""
If we have already 'flag' and we need the second one, how should we name it? flag1 or flag2? What is your favorite?
"""

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
##explain "Variable names should describe their purpose, not just their type"
##hint "What does this boolean flag actually track?"
##replace-span - flag2 has_discount
##explain "Numbered variables (flag2) are rarely descriptive"
##hint "What does this boolean flag indicate about the order?"
