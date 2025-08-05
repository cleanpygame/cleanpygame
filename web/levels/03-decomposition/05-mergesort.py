##file mergesort.py
"""start
This merge sort is allergic to functions. Let's break it down, one helper at a time!
"""
##start-reply "Breaking things!"
def merge_sort(arr):
    if len(arr) <= 1:
        return
##replace extract-split
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
##with
    left, right = _split(arr)
##end
##hint "That mid-slicing logic? It deserves its own home."
##explain "Splitting a list in-place isn’t that self-explanatory. Give it a name."
##option good good "Extract function _split"
##option bad bad-2 "Inline variable mid"
##option bad bad-3 "Add comments"
    merge_sort(left)
    merge_sort(right)
##replace extract-merge
    i = j = k = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1
    while i < len(left):
        arr[k] = left[i]
        i += 1
        k += 1
    while j < len(right):
        arr[k] = right[j]
        j += 1
        k += 1
##with
    _merge(arr, left, right)
##end
##hint "That 20-line merge? Make it disappear."
##explain "That merge block was screaming to be its own function."
##option bad bad-1 "Add spaces"
##option bad bad-2 "Add comments"
##option good good "Extract function"
##add-on extract-split

def _split(arr):
    mid = len(arr) // 2
    return arr[:mid], arr[mid:]
##end
##add-on extract-merge

def _merge(target, left, right):
    i = j = k = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            target[k] = left[i]
            i += 1
        else:
            target[k] = right[j]
            j += 1
        k += 1

    while i < len(left):
        target[k] = left[i]
        i += 1
        k += 1

    while j < len(right):
        target[k] = right[j]
        j += 1
        k += 1
##end
"""final
Now your merge sort reads like a story: split, sort, merge, done. Helpers make logic readable — and bugs easier to kill.
"""
##final-reply "Split. Sorted. Merged."
