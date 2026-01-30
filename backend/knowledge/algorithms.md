# Algorithm Patterns & Example Solutions

This document provides original, educational templates for common algorithm problems (easy/medium). Use these as a knowledge source for the Vu AI agent. Each entry contains: Problem Summary, Approach, Complexity, and runnable example code in Python and JavaScript (additional languages for selected problems).

---

## Two Sum (Array, Hash Map)

Summary: Given an array of integers and a target, return indices of two numbers that add up to the target.

Approach: Use a hash map to store seen values and their indices. For each number x, check if target - x exists in the map.

Complexity: O(n) time, O(n) space.

Python:

```python
from typing import List

def two_sum(nums: List[int], target: int):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return None
```

JavaScript:

```javascript
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return null;
}
```

C++ (snippet):

```cpp
#include <vector>
#include <unordered_map>
using namespace std;
vector<int> twoSum(vector<int>& nums, int target){
    unordered_map<int,int> m;
    for(int i=0;i<nums.size();++i){
        int need = target - nums[i];
        if(m.count(need)) return {m[need], i};
        m[nums[i]] = i;
    }
    return {};
}
```

---

## Reverse Linked List (Iterative)

Summary: Reverse a singly linked list in-place.

Approach: Track `prev` and `curr` pointers, iteratively reverse `curr.next`.

Complexity: O(n) time, O(1) space.

Python:

```python
class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def reverse_list(head: ListNode):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
```

JavaScript (using simple node object):

```javascript
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

---

## Binary Tree — Inorder Traversal (Iterative)

Summary: Return inorder traversal (left, root, right) of a binary tree using a stack.

Approach: Use stack to simulate recursion.

Complexity: O(n) time, O(h) space where h is tree height.

Python:

```python
def inorder_traversal(root):
    stack = []
    curr = root
    res = []
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        res.append(curr.val)
        curr = curr.right
    return res
```

JavaScript:

```javascript
function inorderTraversal(root) {
  const res = [];
  const stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) { stack.push(curr); curr = curr.left; }
    curr = stack.pop();
    res.push(curr.val);
    curr = curr.right;
  }
  return res;
}
```

---

## Longest Substring Without Repeating Characters (Sliding Window)

Summary: Find the length of the longest substring without repeating characters.

Approach: Use sliding window with a map storing last index of characters. Expand right pointer, move left when duplicate found.

Complexity: O(n) time, O(min(n, charset)) space.

Python:

```python
def length_of_longest_substring(s: str) -> int:
    last = {}
    left = 0
    res = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        res = max(res, right - left + 1)
    return res
```

JavaScript:

```javascript
function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, res = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    res = Math.max(res, right - left + 1);
  }
  return res;
}
```

---

## Merge Intervals (Sorting)

Summary: Given intervals, merge overlapping ones.

Approach: Sort intervals by start, iterate and merge overlapping ranges.

Complexity: O(n log n) due to sort.

Python:

```python
def merge_intervals(intervals):
    if not intervals: return []
    intervals.sort(key=lambda x: x[0])
    res = [intervals[0]]
    for s, e in intervals[1:]:
        last_s, last_e = res[-1]
        if s <= last_e:
            res[-1][1] = max(last_e, e)
        else:
            res.append([s, e])
    return res
```

JavaScript:

```javascript
function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a,b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s,e] = intervals[i];
    const last = res[res.length-1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else res.push([s,e]);
  }
  return res;
}
```

---

## Valid Parentheses (Stack)

Summary: Check if a string of brackets is valid (matching and properly nested).

Approach: Use stack and matching map.

Complexity: O(n) time, O(n) space.

Python:

```python
def is_valid(s: str) -> bool:
    match = {')':'(', ']':'[', '}':'{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in match:
            if not stack or stack.pop() != match[ch]:
                return False
    return not stack
```

JavaScript:

```javascript
function isValid(s) {
  const match = {')':'(', ']':'[', '}':'{'};
  const stack = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else {
      if (!stack.length || stack.pop() !== match[ch]) return false;
    }
  }
  return stack.length === 0;
}
```

---

## Binary Search (Template)

Summary: Search sorted array for a target using binary search.

Approach: Standard low/high pointer loop.

Complexity: O(log n) time, O(1) space.

Python:

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums)-1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        if nums[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
```

JavaScript:

```javascript
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

---

## Longest Increasing Subsequence (DP - n log n method overview)

Summary: Compute LIS length using patience sorting / tails array.

Approach: Maintain `tails` where tails[i] is smallest tail of an increasing subsequence of length i+1. Use binary search to update.

Complexity: O(n log n) time, O(n) space.

Python:

```python
import bisect

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
```

JavaScript:

```javascript
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let l = 0, r = tails.length;
    while (l < r) {
      const m = Math.floor((l + r) / 2);
      if (tails[m] < x) l = m + 1; else r = m;
    }
    if (l === tails.length) tails.push(x); else tails[l] = x;
  }
  return tails.length;
}
```

---

## Dynamic Programming - Coin Change (minimum coins)

Summary: Given coin denominations and amount, find minimum coins to make amount.

Approach: Bottom-up DP filling dp[0..amount] with min coins. Return -1 if impossible.

Complexity: O(amount * n_coins) time, O(amount) space.

Python:

```python
def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount
    for a in range(1, amount+1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a-c] + 1)
    return dp[amount] if dp[amount] <= amount else -1
```

JavaScript:

```javascript
function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount+1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a-c] + 1);
  }
  return dp[amount] <= amount ? dp[amount] : -1;
}
```

---

## Notes for Maintainers

- This file is intentionally generic and educational to avoid reproducing proprietary problem statements.
- To extend: add a new section under `backend/knowledge/` as a `.md` file; the Python `ai_agent` loads all files in that folder on startup.
- If you want curated multi-language code for more problems, add files named `algos_<topic>.md` and include code fences.

---

End of algorithms knowledge file.
