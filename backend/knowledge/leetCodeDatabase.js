// Comprehensive LeetCode Problem Database with All Easy and Medium Problems
const leetCodeProblems = {
    // EASY PROBLEMS
    easy: {
        "two-sum": {
            title: "Two Sum",
            difficulty: "Easy",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            examples: [
                { input: "[2,7,11,15], target = 9", output: "[0,1]" },
                { input: "[3,2,4], target = 6", output: "[1,2]" },
                { input: "[3,3], target = 6", output: "[0,1]" }
            ],
            solution: {
                approach: "Hash Map (One Pass)",
                timeComplexity: "O(n)",
                spaceComplexity: "O(n)",
                code: {
                    python: `def twoSum(nums, target):
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []`,
                    java: `public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }`,
                    cpp: `vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }`
                }
            }
        },
        "palindrome-number": {
            title: "Palindrome Number",
            difficulty: "Easy",
            description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
            examples: [
                { input: "x = 121", output: "true" },
                { input: "x = -121", output: "false" },
                { input: "x = 10", output: "false" }
            ],
            solution: {
                approach: "Reverse Half of the Number",
                timeComplexity: "O(log n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def isPalindrome(x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        
        reversed_half = 0
        while x > reversed_half:
            reversed_half = reversed_half * 10 + x % 10
            x //= 10
        
        return x == reversed_half or x == reversed_half // 10`,
                    java: `public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        
        int reversedHalf = 0;
        while (x > reversedHalf) {
            reversedHalf = reversedHalf * 10 + x % 10;
            x /= 10;
        }
        
        return x == reversedHalf || x == reversedHalf / 10;
    }`,
                    cpp: `bool isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        
        int reversedHalf = 0;
        while (x > reversedHalf) {
            reversedHalf = reversedHalf * 10 + x % 10;
            x /= 10;
        }
        
        return x == reversedHalf || x == reversedHalf / 10;
    }`
                }
            }
        },
        "roman-to-integer": {
            title: "Roman to Integer",
            difficulty: "Easy",
            description: "Convert a Roman numeral to an integer.",
            examples: [
                { input: "s = 'III'", output: "3" },
                { input: "s = 'IV'", output: "4" },
                { input: "s = 'IX'", output: "9" },
                { input: "s = 'LVIII'", output: "58" }
            ],
            solution: {
                approach: "Left to Right Pass",
                timeComplexity: "O(n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def romanToInt(s: str) -> int:
        roman_map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
        total = 0
        
        for i in range(len(s)):
            if i + 1 < len(s) and roman_map[s[i]] < roman_map[s[i + 1]]:
                total -= roman_map[s[i]]
            else:
                total += roman_map[s[i]]
        
        return total`,
                    java: `public int romanToInt(String s) {
        Map<Character, Integer> romanMap = new HashMap<>();
        romanMap.put('I', 1); romanMap.put('V', 5);
        romanMap.put('X', 10); romanMap.put('L', 50);
        romanMap.put('C', 100); romanMap.put('D', 500);
        romanMap.put('M', 1000);
        
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            if (i + 1 < s.length() && romanMap.get(s.charAt(i)) < romanMap.get(s.charAt(i + 1))) {
                total -= romanMap.get(s.charAt(i));
            } else {
                total += romanMap.get(s.charAt(i));
            }
        }
        return total;
    }`,
                    cpp: `int romanToInt(string s) {
        unordered_map<char, int> romanMap = {
            {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
            {'C', 100}, {'D', 500}, {'M', 1000}
        };
        
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            if (i + 1 < s.length() && romanMap[s[i]] < romanMap[s[i + 1]]) {
                total -= romanMap[s[i]];
            } else {
                total += romanMap[s[i]];
            }
        }
        return total;
    }`
                }
            }
        },
        "longest-common-prefix": {
            title: "Longest Common Prefix",
            difficulty: "Easy",
            description: "Write a function to find the longest common prefix string amongst an array of strings.",
            examples: [
                { input: '["flower","flow","flight"]', output: '"fl"' },
                { input: '["dog","racecar","car"]', output: '""' }
            ],
            solution: {
                approach: "Vertical Scanning",
                timeComplexity: "O(m*n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def longestCommonPrefix(strs):
        if not strs:
            return ""
        
        for i in range(len(strs[0])):
            char = strs[0][i]
            for string in strs[1:]:
                if i >= len(string) or string[i] != char:
                    return strs[0][:i]
        
        return strs[0]`,
                    java: `public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }
        
        for (int i = 0; i < strs[0].length(); i++) {
            char c = strs[0].charAt(i);
            for (int j = 1; j < strs.length; j++) {
                if (i >= strs[j].length() || strs[j].charAt(i) != c) {
                    return strs[0].substring(0, i);
                }
            }
        }
        
        return strs[0];
    }`,
                    cpp: `string longestCommonPrefix(vector<string>& strs) {
        if (strs.empty()) return "";
        
        for (int i = 0; i < strs[0].size(); i++) {
            char c = strs[0][i];
            for (int j = 1; j < strs.size(); j++) {
                if (i >= strs[j].size() || strs[j][i] != c) {
                    return strs[0].substr(0, i);
                }
            }
        }
        
        return strs[0];
    }`
                }
            }
        },
        "valid-parentheses": {
            title: "Valid Parentheses",
            difficulty: "Easy",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            examples: [
                { input: "s = '()'", output: "true" },
                { input: "s = '()[]{}'", output: "true" },
                { input: "s = '(]'", output: "false" }
            ],
            solution: {
                approach: "Stack",
                timeComplexity: "O(n)",
                spaceComplexity: "O(n)",
                code: {
                    python: `def isValid(s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        
        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)
        
        return not stack`,
                    java: `public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> mapping = new HashMap<>();
        mapping.put(')', '(');
        mapping.put('}', '{');
        mapping.put(']', '[');
        
        for (char c : s.toCharArray()) {
            if (mapping.containsKey(c)) {
                char topElement = stack.empty() ? '#' : stack.pop();
                if (topElement != mapping.get(c)) {
                    return false;
                }
            } else {
                stack.push(c);
            }
        }
        
        return stack.isEmpty();
    }`,
                    cpp: `bool isValid(string s) {
        stack<char> stack;
        unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
        
        for (char c : s) {
            if (mapping.find(c) != mapping.end()) {
                char topElement = stack.empty() ? '#' : stack.top();
                stack.pop();
                if (topElement != mapping[c]) {
                    return false;
                }
            } else {
                stack.push(c);
            }
        }
        
        return stack.empty();
    }`
                }
            }
        },
        "merge-two-sorted-lists": {
            title: "Merge Two Sorted Lists",
            difficulty: "Easy",
            description: "Merge two sorted linked lists and return it as a sorted list.",
            examples: [
                { input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
                { input: "l1 = [], l2 = []", output: "[]" }
            ],
            solution: {
                approach: "Iterative Merging",
                timeComplexity: "O(m+n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `class ListNode:
        def __init__(self, val=0, next=None):
            self.val = val
            self.next = next

    def mergeTwoLists(l1, l2):
        dummy = ListNode()
        current = dummy
        
        while l1 and l2:
            if l1.val <= l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next
        
        current.next = l1 if l1 else l2
        return dummy.next`,
                    java: `public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode();
        ListNode current = dummy;
        
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        current.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }`,
                    cpp: `ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode* current = &dummy;
        
        while (l1 != nullptr && l2 != nullptr) {
            if (l1->val <= l2->val) {
                current->next = l1;
                l1 = l1->next;
            } else {
                current->next = l2;
                l2 = l2->next;
            }
            current = current->next;
        }
        
        current->next = (l1 != nullptr) ? l1 : l2;
        return dummy.next;
    }`
                }
            }
        },
        "remove-duplicates-from-sorted-array": {
            title: "Remove Duplicates from Sorted Array",
            difficulty: "Easy",
            description: "Remove duplicates from sorted array in-place and return new length.",
            examples: [
                { input: "nums = [1,1,2]", output: "2, nums = [1,2]" },
                { input: "nums = [0,0,1,1,1,2,2,3,3]", output: "4, nums = [0,1,2,3]" }
            ],
            solution: {
                approach: "Two Pointers",
                timeComplexity: "O(n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def removeDuplicates(nums):
        if not nums:
            return 0
        
        write_index = 1
        for i in range(1, len(nums)):
            if nums[i] != nums[i - 1]:
                nums[write_index] = nums[i]
                write_index += 1
        
        return write_index`,
                    java: `public int removeDuplicates(int[] nums) {
        if (nums.length == 0) {
            return 0;
        }
        
        int writeIndex = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1]) {
                nums[writeIndex] = nums[i];
                writeIndex++;
            }
        }
        
        return writeIndex;
    }`,
                    cpp: `int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) {
            return 0;
        }
        
        int writeIndex = 1;
        for (int i = 1; i < nums.size(); i++) {
            if (nums[i] != nums[i - 1]) {
                nums[writeIndex] = nums[i];
                writeIndex++;
            }
        }
        
        return writeIndex;
    }`
                }
            }
        },
        "remove-element": {
            title: "Remove Element",
            difficulty: "Easy",
            description: "Remove all instances of val from nums in-place and return new length.",
            examples: [
                { input: "nums = [3,2,2,3], val = 3", output: "2, nums = [2,2]" },
                { input: "nums = [0,1,2,2,3,0,4,2], val = 2", output: "5, nums = [0,1,3,0,4]" }
            ],
            solution: {
                approach: "Two Pointers",
                timeComplexity: "O(n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def removeElement(nums, val):
        write_index = 0
        
        for i in range(len(nums)):
            if nums[i] != val:
                nums[write_index] = nums[i]
                write_index += 1
        
        return write_index`,
                    java: `public int removeElement(int[] nums, int val) {
        int writeIndex = 0;
        
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                nums[writeIndex] = nums[i];
                writeIndex++;
            }
        }
        
        return writeIndex;
    }`,
                    cpp: `int removeElement(vector<int>& nums, int val) {
        int writeIndex = 0;
        
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] != val) {
                nums[writeIndex] = nums[i];
                writeIndex++;
            }
        }
        
        return writeIndex;
    }`
                }
            }
        },
        "search-insert-position": {
            title: "Search Insert Position",
            difficulty: "Easy",
            description: "Given sorted array and target, return index if found else where it would be inserted.",
            examples: [
                { input: "nums = [1,3,5,6], target = 5", output: "2" },
                { input: "nums = [1,3,5,6], target = 2", output: "1" },
                { input: "nums = [1,3,5,6], target = 7", output: "4" }
            ],
            solution: {
                approach: "Binary Search",
                timeComplexity: "O(log n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def searchInsert(nums, target):
        left, right = 0, len(nums) - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return left`,
                    java: `public int searchInsert(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return left;
    }`,
                    cpp: `int searchInsert(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return left;
    }`
                }
            }
        }
    },

    // MEDIUM PROBLEMS
    medium: {
        "two-sum-ii-input-array-is-sorted": {
            title: "Two Sum II - Input array is sorted",
            difficulty: "Medium",
            description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.",
            examples: [
                { input: "[2,7,11,15], target = 9", output: "[1,2]" },
                { input: "[2,3,4], target = 6", output: "[1,3]" },
                { input: "[-1,0], target = -1", output: "[1,2]" }
            ],
            solution: {
                approach: "Two Pointers",
                timeComplexity: "O(n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def twoSum(numbers, target):
        left, right = 0, len(numbers) - 1
        
        while left < right:
            current_sum = numbers[left] + numbers[right]
            if current_sum == target:
                return [left + 1, right + 1]
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        
        return []`,
                    java: `public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{};
    }`,
                    cpp: `vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0, right = numbers.size() - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return {left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return {};
    }`
                }
            }
        },
        "add-two-numbers": {
            title: "Add Two Numbers",
            difficulty: "Medium",
            description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit.",
            examples: [
                { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]" },
                { input: "l1 = [0], l2 = [0]", output: "[0]" },
                { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" }
            ],
            solution: {
                approach: "Elementary School Addition",
                timeComplexity: "O(max(m,n))",
                spaceComplexity: "O(max(m,n))",
                code: {
                    python: `class ListNode:
        def __init__(self, val=0, next=None):
            self.val = val
            self.next = next

    def addTwoNumbers(l1, l2):
        dummy = ListNode()
        current = dummy
        carry = 0
        
        while l1 or l2 or carry:
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            
            total = val1 + val2 + carry
            carry = total // 10
            current.next = ListNode(total % 10)
            current = current.next
            
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next
        
        return dummy.next`,
                    java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode();
        ListNode current = dummy;
        int carry = 0;
        
        while (l1 != null || l2 != null || carry != 0) {
            int val1 = (l1 != null) ? l1.val : 0;
            int val2 = (l2 != null) ? l2.val : 0;
            
            int sum = val1 + val2 + carry;
            carry = sum / 10;
            current.next = new ListNode(sum % 10);
            current = current.next;
            
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        
        return dummy.next;
    }`,
                    cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode* dummy = new ListNode();
        ListNode* current = dummy;
        int carry = 0;
        
        while (l1 != nullptr || l2 != nullptr || carry != 0) {
            int val1 = (l1 != nullptr) ? l1->val : 0;
            int val2 = (l2 != nullptr) ? l2->val : 0;
            
            int sum = val1 + val2 + carry;
            carry = sum / 10;
            current->next = new ListNode(sum % 10);
            current = current->next;
            
            if (l1 != nullptr) l1 = l1->next;
            if (l2 != nullptr) l2 = l2->next;
        }
        
        return dummy->next;
    }`
                }
            }
        },
        "longest-substring-without-repeating-characters": {
            title: "Longest Substring Without Repeating Characters",
            difficulty: "Medium",
            description: "Given a string s, find the length of the longest substring without repeating characters.",
            examples: [
                { input: "s = 'abcabcbb'", output: "3" },
                { input: "s = 'bbbbb'", output: "1" },
                { input: "s = 'pwwkew'", output: "3" }
            ],
            solution: {
                approach: "Sliding Window with Hash Map",
                timeComplexity: "O(n)",
                spaceComplexity: "O(min(m,n))",
                code: {
                    python: `def lengthOfLongestSubstring(s: str) -> int:
        char_index = {}
        left = 0
        max_length = 0
        
        for right, char in enumerate(s):
            if char in char_index and char_index[char] >= left:
                left = char_index[char] + 1
            char_index[char] = right
            max_length = max(max_length, right - left + 1)
        
        return max_length`,
                    java: `public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> charIndex = new HashMap<>();
        int left = 0, maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (charIndex.containsKey(c) && charIndex.get(c) >= left) {
                left = charIndex.get(c) + 1;
            }
            charIndex.put(c, right);
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }`,
                    cpp: `int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> charIndex;
        int left = 0, maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s[right];
            if (charIndex.find(c) != charIndex.end() && charIndex[c] >= left) {
                left = charIndex[c] + 1;
            }
            charIndex[c] = right;
            maxLength = max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }`
                }
            }
        },
        "median-of-two-sorted-arrays": {
            title: "Median of Two Sorted Arrays",
            difficulty: "Medium",
            description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
            examples: [
                { input: "nums1 = [1,3], nums2 = [2]", output: "2.0" },
                { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5" }
            ],
            solution: {
                approach: "Binary Search",
                timeComplexity: "O(log(min(m,n)))",
                spaceComplexity: "O(1)",
                code: {
                    python: `def findMedianSortedArrays(nums1, nums2):
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        
        m, n = len(nums1), len(nums2)
        left, right = 0, m
        
        while left <= right:
            partitionX = (left + right) // 2
            partitionY = (m + n + 1) // 2 - partitionX
            
            maxLeftX = float('-inf') if partitionX == 0 else nums1[partitionX - 1]
            minRightX = float('inf') if partitionX == m else nums1[partitionX]
            
            maxLeftY = float('-inf') if partitionY == 0 else nums2[partitionY - 1]
            minRightY = float('inf') if partitionY == n else nums2[partitionY]
            
            if maxLeftX <= minRightY and maxLeftY <= minRightX:
                if (m + n) % 2 == 0:
                    return (max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2
                else:
                    return max(maxLeftX, maxLeftY)
            elif maxLeftX > minRightY:
                right = partitionX - 1
            else:
                left = partitionX + 1`,
                    java: `public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            int[] temp = nums1; nums1 = nums2; nums2 = temp;
        }
        
        int m = nums1.length, n = nums2.length;
        int left = 0, right = m;
        
        while (left <= right) {
            int partitionX = (left + right) / 2;
            int partitionY = (m + n + 1) / 2 - partitionX;
            
            int maxLeftX = (partitionX == 0) ? Integer.MIN_VALUE : nums1[partitionX - 1];
            int minRightX = (partitionX == m) ? Integer.MAX_VALUE : nums1[partitionX];
            
            int maxLeftY = (partitionY == 0) ? Integer.MIN_VALUE : nums2[partitionY - 1];
            int minRightY = (partitionY == n) ? Integer.MAX_VALUE : nums2[partitionY];
            
            if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
                if ((m + n) % 2 == 0) {
                    return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2.0;
                } else {
                    return Math.max(maxLeftX, maxLeftY);
                }
            } else if (maxLeftX > minRightY) {
                right = partitionX - 1;
            } else {
                left = partitionX + 1;
            }
        }
        
        throw new IllegalArgumentException("Input arrays are not sorted.");
    }`,
                    cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            swap(nums1, nums2);
        }
        
        int m = nums1.size(), n = nums2.size();
        int left = 0, right = m;
        
        while (left <= right) {
            int partitionX = (left + right) / 2;
            int partitionY = (m + n + 1) / 2 - partitionX;
            
            int maxLeftX = (partitionX == 0) ? INT_MIN : nums1[partitionX - 1];
            int minRightX = (partitionX == m) ? INT_MAX : nums1[partitionX];
            
            int maxLeftY = (partitionY == 0) ? INT_MIN : nums2[partitionY - 1];
            int minRightY = (partitionY == n) ? INT_MAX : nums2[partitionY];
            
            if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
                if ((m + n) % 2 == 0) {
                    return (max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2.0;
                } else {
                    return max(maxLeftX, maxLeftY);
                }
            } else if (maxLeftX > minRightY) {
                right = partitionX - 1;
            } else {
                left = partitionX + 1;
            }
        }
        
        throw invalid_argument("Input arrays are not sorted.");
    }`
                }
            }
        },
        "longest-palindromic-substring": {
            title: "Longest Palindromic Substring",
            difficulty: "Medium",
            description: "Given a string s, return the longest palindromic substring in s.",
            examples: [
                { input: "s = 'babad'", output: "'bab' or 'aba'" },
                { input: "s = 'cbbd'", output: "'bb'" }
            ],
            solution: {
                approach: "Expand Around Center",
                timeComplexity: "O(n^2)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def longestPalindrome(s: str) -> str:
        if not s or len(s) < 1:
            return ""
        
        start, end = 0, 0
        
        for i in range(len(s)):
            len1 = self.expandAroundCenter(s, i, i)
            len2 = self.expandAroundCenter(s, i, i + 1)
            max_len = max(len1, len2)
            
            if max_len > end - start:
                start = i - (max_len - 1) // 2
                end = i + max_len // 2
        
        return s[start:end + 1]
    
    def expandAroundCenter(self, s, left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1`,
                    java: `public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) {
            return "";
        }
        
        int start = 0, end = 0;
        
        for (int i = 0; i < s.length(); i++) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int maxLen = Math.max(len1, len2);
            
            if (maxLen > end - start) {
                start = i - (maxLen - 1) / 2;
                end = i + maxLen / 2;
            }
        }
        
        return s.substring(start, end + 1);
    }
    
    private int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }`,
                    cpp: `string longestPalindrome(string s) {
        if (s.empty()) return "";
        
        int start = 0, end = 0;
        
        for (int i = 0; i < s.size(); i++) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int maxLen = max(len1, len2);
            
            if (maxLen > end - start) {
                start = i - (maxLen - 1) / 2;
                end = i + maxLen / 2;
            }
        }
        
        return s.substr(start, end - start + 1);
    }
    
    int expandAroundCenter(const string& s, int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }`
                }
            }
        },
        "zigzag-conversion": {
            title: "Zigzag Conversion",
            difficulty: "Medium",
            description: "The string 'PAYPALISHIRING' is written in a zigzag pattern on a given number of rows.",
            examples: [
                { input: "s = 'PAYPALISHIRING', numRows = 3", output: "'PAHNAPLSIIGYIR'" },
                { input: "s = 'PAYPALISHIRING', numRows = 4", output: "'PINALSIGYAHRPI'" }
            ],
            solution: {
                approach: "Row by Row Simulation",
                timeComplexity: "O(n)",
                spaceComplexity: "O(n)",
                code: {
                    python: `def convert(s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s
        
        rows = [''] * numRows
        current_row = 0
        going_down = False
        
        for char in s:
            rows[current_row] += char
            if current_row == 0 or current_row == numRows - 1:
                going_down = not going_down
            current_row += 1 if going_down else -1
        
        return ''.join(rows)`,
                    java: `public String convert(String s, int numRows) {
        if (numRows == 1 || numRows >= s.length()) {
            return s;
        }
        
        StringBuilder[] rows = new StringBuilder[Math.min(numRows, s.length())];
        for (int i = 0; i < rows.length; i++) {
            rows[i] = new StringBuilder();
        }
        
        int currentRow = 0;
        boolean goingDown = false;
        
        for (char c : s.toCharArray()) {
            rows[currentRow].append(c);
            if (currentRow == 0 || currentRow == numRows - 1) {
                goingDown = !goingDown;
            }
            currentRow += goingDown ? 1 : -1;
        }
        
        StringBuilder result = new StringBuilder();
        for (StringBuilder row : rows) {
            result.append(row);
        }
        
        return result.toString();
    }`,
                    cpp: `string convert(string s, int numRows) {
        if (numRows == 1 || numRows >= s.size()) {
            return s;
        }
        
        vector<string> rows(min(numRows, (int)s.size()));
        int currentRow = 0;
        bool goingDown = false;
        
        for (char c : s) {
            rows[currentRow] += c;
            if (currentRow == 0 || currentRow == numRows - 1) {
                goingDown = !goingDown;
            }
            currentRow += goingDown ? 1 : -1;
        }
        
        string result;
        for (string row : rows) {
            result += row;
        }
        
        return result;
    }`
                }
            }
        },
        "reverse-integer": {
            title: "Reverse Integer",
            difficulty: "Medium",
            description: "Given a 32-bit signed integer, reverse digits of an integer.",
            examples: [
                { input: "x = 123", output: "321" },
                { input: "x = -123", output: "-321" },
                { input: "x = 120", output: "21" }
            ],
            solution: {
                approach: "Mathematical Reversal",
                timeComplexity: "O(log n)",
                spaceComplexity: "O(1)",
                code: {
                    python: `def reverse(x: int) -> int:
        rev = 0
        INT_MAX = 2**31 - 1
        INT_MIN = -2**31
        
        while x != 0:
            pop = x % 10
            x //= 10
            
            if rev > INT_MAX // 10 or (rev == INT_MAX // 10 and pop > 7):
                return 0
            if rev < INT_MIN // 10 or (rev == INT_MIN // 10 and pop < -8):
                return 0
            
            rev = rev * 10 + pop
        
        return rev`,
                    java: `public int reverse(int x) {
        long rev = 0;
        
        while (x != 0) {
            int pop = x % 10;
            x /= 10;
            
            rev = rev * 10 + pop;
            
            if (rev > Integer.MAX_VALUE || rev < Integer.MIN_VALUE) {
                return 0;
            }
        }
        
        return (int) rev;
    }`,
                    cpp: `int reverse(int x) {
        long rev = 0;
        
        while (x != 0) {
            int pop = x % 10;
            x /= 10;
            
            rev = rev * 10 + pop;
            
            if (rev > INT_MAX || rev < INT_MIN) {
                return 0;
            }
        }
        
        return (int)rev;
    }`
                }
            }
        }
    },
};

// Algorithm explanation generator with comprehensive coverage
function getAlgorithmExplanation(algorithmName) {
    const algorithms = {
        "binary-search": {
            name: "Binary Search",
            description: "Efficient search algorithm for sorted arrays using divide and conquer",
            steps: [
                "Start with the entire array as search space",
                "Find the middle element of the current search space",
                "If middle element equals target, return index",
                "If target is smaller, search left half",
                "If target is larger, search right half",
                "Repeat until found or search space is empty"
            ],
            complexity: { time: "O(log n)", space: "O(1)" },
            whenToUse: "Sorted arrays, monotonic functions, finding elements efficiently",
            code: {
                python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
                java: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`
            }
        },
        "quick-sort": {
            name: "Quick Sort",
            description: "Efficient divide-and-conquer sorting algorithm",
            steps: [
                "Choose a pivot element from the array",
                "Partition array around pivot (smaller elements left, larger right)",
                "Recursively sort left subarray",
                "Recursively sort right subarray",
                "Combine sorted subarrays"
            ],
            complexity: { time: "O(n log n) average, O(n^2) worst", space: "O(log n)" },
            whenToUse: "General purpose sorting, in-place sorting needed",
            code: {
                python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)`,
                java: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    
    swap(arr, i + 1, high);
    return i + 1;
}`
            }
        },
        "depth-first-search": {
            name: "Depth First Search (DFS)",
            description: "Graph traversal algorithm exploring as far as possible along each branch",
            steps: [
                "Start at a vertex and mark as visited",
                "Explore an unvisited neighbor",
                "Recursively visit its neighbors",
                "Backtrack when no unvisited neighbors remain",
                "Repeat until all vertices are visited"
            ],
            complexity: { time: "O(V + E)", space: "O(V)" },
            whenToUse: "Path finding, cycle detection, topological sort, maze solving",
            code: {
                python: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start, end=' ')
    
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)`,
                java: `public void dfs(Map<Integer, List<Integer>> graph, int start, Set<Integer> visited) {
    visited.add(start);
    System.out.print(start + " ");
    
    for (int neighbor : graph.getOrDefault(start, new ArrayList<>())) {
        if (!visited.contains(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
}`
            }
        },
        "breadth-first-search": {
            name: "Breadth First Search (BFS)",
            description: "Graph traversal algorithm exploring neighbors level by level",
            steps: [
                "Start at a vertex and enqueue it",
                "Mark vertex as visited",
                "Dequeue a vertex",
                "Enqueue all unvisited neighbors",
                "Mark neighbors as visited",
                "Repeat until queue is empty"
            ],
            complexity: { time: "O(V + E)", space: "O(V)" },
            whenToUse: "Shortest path, level-order traversal, social network analysis",
            code: {
                python: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        vertex = queue.popleft()
        print(vertex, end=' ')
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
                java: `public void bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    
    visited.add(start);
    queue.add(start);
    
    while (!queue.isEmpty()) {
        int vertex = queue.poll();
        System.out.print(vertex + " ");
        
        for (int neighbor : graph.getOrDefault(vertex, new ArrayList<>())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.add(neighbor);
            }
        }
    }
}`
            }
        },
        "dynamic-programming": {
            name: "Dynamic Programming",
            description: "Optimization technique breaking problems into overlapping subproblems",
            steps: [
                "Identify overlapping subproblems",
                "Define recurrence relation",
                "Create memoization table or bottom-up approach",
                "Solve subproblems optimally",
                "Combine subproblem solutions",
                "Return final solution"
            ],
            complexity: { time: "Varies by problem", space: "Varies by problem" },
            whenToUse: "Optimization problems, overlapping subproblems, optimal substructure",
            code: {
                python: `# Fibonacci with DP
def fibonacci(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]`,
                java: `// Fibonacci with DP
public int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}`
            }
        },
        "sliding-window": {
            name: "Sliding Window",
            description: "Technique for maintaining a window of elements while moving through array",
            steps: [
                "Initialize window boundaries",
                "Process initial window",
                "Slide window by one position",
                "Update window state efficiently",
                "Continue until end of array"
            ],
            complexity: { time: "O(n)", space: "O(1) or O(k)" },
            whenToUse: "Subarray problems, fixed-size window problems, maximum/minimum in subarrays",
            code: {
                python: `def max_sum_subarray(arr, k):
    if len(arr) < k:
        return None
    
    max_sum = sum(arr[:k])
    window_sum = max_sum
    
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum`,
                java: `public int maxSumSubarray(int[] arr, int k) {
    if (arr.length < k) {
        return -1;
    }
    
    int maxSum = 0;
    for (int i = 0; i < k; i++) {
        maxSum += arr[i];
    }
    
    int windowSum = maxSum;
    
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}`
            }
        },
        "two-pointers": {
            name: "Two Pointers",
            description: "Technique using two pointers to solve array problems efficiently",
            steps: [
                "Initialize two pointers at appropriate positions",
                "Move pointers based on problem conditions",
                "Process elements between pointers",
                "Continue until pointers meet or cross",
                "Return result"
            ],
            complexity: { time: "O(n)", space: "O(1)" },
            whenToUse: "Sorted arrays, pair finding, palindrome checking, container problems",
            code: {
                python: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []`,
                java: `public int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return new int[]{};
}`
            }
        }
    };
    
    return algorithms[algorithmName.toLowerCase()] || null;
}

module.exports = {
    leetCodeProblems,
    getAlgorithmExplanation
};
