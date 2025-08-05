##file mergesort_v2.py
"""start
This merge sort is allergic to functions. Let's break it down, one helper at a time!
"""
##start-reply "Breaking things!"
def merge_sort(arr):
    if len(arr) <= 1:
        return
    left, right = _split(arr)
    merge_sort(left)
    merge_sort(right)
    _merge(arr, left, right)

def _split(arr):
    mid = len(arr) // 2
    return arr[:mid], arr[mid:]

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

##replace extract-copy-left
    while i < len(left):
        target[k] = left[i]
        i += 1
        k += 1
##with
    _copy_tail(target, k, left, i)
##end
##explain "That loop looks familiar. Let’s abstract it."
##hint "One line instead of three. Worth it."
##replace extract-copy-right
    while j < len(right):
        target[k] = right[j]
        j += 1
        k += 1
##with
    _copy_tail(target, k, right, j)
##end
##explain "Duplication is boring. Helpers are fun."
##hint "Looks just like the other one, doesn’t it?"
##add-on extract-copy-right extract-copy-left

def _copy_tail(dst, dst_index, src, src_index):
    for value in src[src_index:]:
        dst[dst_index] = value
        dst_index += 1
##end
"""final
Now your merge sort reads like a story: split, sort, merge, done. Helpers make logic readable — and bugs easier to kill.
"""
##final-reply "Split. Sorted. Merged."
