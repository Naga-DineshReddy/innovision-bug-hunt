import { Question } from "@/types";

export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // ROUND 1 — EASY: BUG HUNT BASICS
  // 3:00–3:10 PM • 8 questions • 20 marks
  // ==========================================
  {
    id: "BH-R1-Q01",
    round_id: 1,
    question_number: 1,
    title: "Wrong Arithmetic Operator",
    description: "The program should print the sum of two numbers.",
    language: "python",
    difficulty: "Easy",
    marks: 2,
    category: "Arithmetic operator",
    explanation: "The subtraction operator must be replaced by addition.",
    buggy_code: `a = 25
b = 15
result = a - b
print("Sum:", result)`,
    solution_code: `a = 25
b = 15
result = a + b
print("Sum:", result)`,
    test_cases: [
      { id: "t1", input: "a = 25, b = 15", expected_output: "Sum: 40", is_hidden: false, description: "Sum of 25 and 15" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q02",
    round_id: 1,
    question_number: 2,
    title: "Incorrect Comparison",
    description: "Print Eligible when marks are 40 or above.",
    language: "python",
    difficulty: "Easy",
    marks: 2,
    category: "Comparison",
    explanation: "The condition is reversed.",
    buggy_code: `marks = 55
if marks < 40:
    print("Eligible")
else:
    print("Not Eligible")`,
    solution_code: `marks = 55
if marks >= 40:
    print("Eligible")
else:
    print("Not Eligible")`,
    test_cases: [
      { id: "t1", input: "marks = 55", expected_output: "Eligible", is_hidden: false, description: "Marks >= 40 check" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q03",
    round_id: 1,
    question_number: 3,
    title: "Wrong Loop Range",
    description: "Print numbers from 1 to 5.",
    language: "python",
    difficulty: "Easy",
    marks: 2,
    category: "Loop range",
    explanation: "The upper bound of range is excluded.",
    buggy_code: `for i in range(1, 5):
    print(i)`,
    solution_code: `for i in range(1, 6):
    print(i)`,
    test_cases: [
      { id: "t1", input: "range(1, 6)", expected_output: "1 2 3 4 5", is_hidden: false, description: "Numbers 1 through 5 inclusive" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q04",
    round_id: 1,
    question_number: 4,
    title: "List Index Error",
    description: "Find and fix the invalid index.",
    language: "python",
    difficulty: "Easy",
    marks: 2,
    category: "List index",
    explanation: "Valid indices are 0 through 4.",
    buggy_code: `numbers = [10, 20, 30, 40, 50]
print(numbers[5])`,
    solution_code: `numbers = [10, 20, 30, 40, 50]
print(numbers[4])`,
    test_cases: [
      { id: "t1", input: "numbers[4]", expected_output: "50", is_hidden: false, description: "Access last element at index 4" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q05",
    round_id: 1,
    question_number: 5,
    title: "Wrong Variable",
    description: "Find the undefined variable.",
    language: "python",
    difficulty: "Easy",
    marks: 3,
    category: "Variable",
    explanation: "nme is undefined; name was declared.",
    buggy_code: `name = "INNOVISION"
print("Hello", nme)`,
    solution_code: `name = "INNOVISION"
print("Hello", name)`,
    test_cases: [
      { id: "t1", input: 'name = "INNOVISION"', expected_output: "Hello INNOVISION", is_hidden: false, description: "Prints greeting with correct variable" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q06",
    round_id: 1,
    question_number: 6,
    title: "Function Return Bug",
    description: "Return the square of a number.",
    language: "python",
    difficulty: "Easy",
    marks: 3,
    category: "Function return",
    explanation: "The function must return its calculated value.",
    buggy_code: `def square(n):
    result = n * n

number = 6
print(square(number))`,
    solution_code: `def square(n):
    result = n * n
    return result

number = 6
print(square(number))`,
    test_cases: [
      { id: "t1", input: "square(6)", expected_output: "36", is_hidden: false, description: "Returns 36" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q07",
    round_id: 1,
    question_number: 7,
    title: "Input Conversion",
    description: "Read an age and check whether it is at least 18.",
    language: "python",
    difficulty: "Easy",
    marks: 3,
    category: "Input conversion",
    explanation: "input() returns a string, so numeric conversion is required.",
    buggy_code: `age = input("Enter age: ")
if age >= 18:
    print("Eligible")
else:
    print("Not Eligible")`,
    solution_code: `age = int(input("Enter age: "))
if age >= 18:
    print("Eligible")
else:
    print("Not Eligible")`,
    test_cases: [
      { id: "t1", input: 'input = "20"', expected_output: "Eligible", is_hidden: false, description: "Integer converted comparison" }
    ],
    is_active: true
  },
  {
    id: "BH-R1-Q08",
    round_id: 1,
    question_number: 8,
    title: "Incorrect List Total",
    description: "Calculate the sum of all values.",
    language: "python",
    difficulty: "Easy",
    marks: 3,
    category: "List accumulation",
    explanation: "The original code overwrites total instead of accumulating.",
    buggy_code: `numbers = [10, 20, 30, 40]
total = 0
for number in numbers:
    total = number
print(total)`,
    solution_code: `numbers = [10, 20, 30, 40]
total = 0
for number in numbers:
    total += number
print(total)`,
    test_cases: [
      { id: "t1", input: "[10, 20, 30, 40]", expected_output: "100", is_hidden: false, description: "Accumulate total sum" }
    ],
    is_active: true
  },

  // ==========================================
  // ROUND 2 — MODERATE: DEBUGGING CHALLENGE
  // 3:10–3:25 PM • 5 questions • 30 marks
  // ==========================================
  {
    id: "BH-R2-Q09",
    round_id: 2,
    question_number: 1,
    title: "Runtime Error in List Traversal",
    description: "Calculate the sum without an index error.",
    language: "python",
    difficulty: "Medium",
    marks: 4,
    category: "List traversal / runtime",
    explanation: "The loop creates one index beyond the list.",
    buggy_code: `numbers = [10, 20, 30, 40]
total = 0
for i in range(len(numbers) + 1):
    total += numbers[i]
print(total)`,
    solution_code: `numbers = [10, 20, 30, 40]
total = 0
for i in range(len(numbers)):
    total += numbers[i]
print(total)`,
    test_cases: [
      { id: "t1", input: "[10, 20, 30, 40]", expected_output: "100", is_hidden: false, description: "Sum without index error" }
    ],
    is_active: true
  },
  {
    id: "BH-R2-Q10",
    round_id: 2,
    question_number: 2,
    title: "Even Number Logic",
    description: "Calculate the sum of all even numbers.",
    language: "python",
    difficulty: "Medium",
    marks: 5,
    category: "Even-number logic",
    explanation: "The condition must select numbers divisible by 2.",
    buggy_code: `numbers = [5, 10, 15, 20, 24]
even_sum = 0
for number in numbers:
    if number % 2 == 1:
        even_sum += number
print(even_sum)`,
    solution_code: `numbers = [5, 10, 15, 20, 24]
even_sum = 0
for number in numbers:
    if number % 2 == 0:
        even_sum += number
print(even_sum)`,
    test_cases: [
      { id: "t1", input: "[5, 10, 15, 20, 24]", expected_output: "54", is_hidden: false, description: "Sum of 10 + 20 + 24" }
    ],
    is_active: true
  },
  {
    id: "BH-R2-Q11",
    round_id: 2,
    question_number: 3,
    title: "Largest Number Function",
    description: "Return the largest of two numbers.",
    language: "python",
    difficulty: "Medium",
    marks: 6,
    category: "Function logic",
    explanation: "The comparison returns the smaller value in the buggy version.",
    buggy_code: `def largest(a, b):
    if a < b:
        return a
    return b

print(largest(25, 40))`,
    solution_code: `def largest(a, b):
    if a > b:
        return a
    return b

print(largest(25, 40))`,
    test_cases: [
      { id: "t1", input: "largest(25, 40)", expected_output: "40", is_hidden: false, description: "Max of 25 and 40" }
    ],
    is_active: true
  },
  {
    id: "BH-R2-Q12",
    round_id: 2,
    question_number: 4,
    title: "Average Calculation",
    description: "Calculate the average of all marks.",
    language: "python",
    difficulty: "Medium",
    marks: 7,
    category: "Average calculation",
    explanation: "The denominator must equal the number of values.",
    buggy_code: `marks = [80, 70, 90, 60]
total = 0
for mark in marks:
    total += mark
average = total / 3
print(average)`,
    solution_code: `marks = [80, 70, 90, 60]
total = 0
for mark in marks:
    total += mark
average = total / len(marks)
print(average)`,
    test_cases: [
      { id: "t1", input: "[80, 70, 90, 60]", expected_output: "75.0", is_hidden: false, description: "Average: 300 / 4 = 75.0" }
    ],
    is_active: true
  },
  {
    id: "BH-R2-Q13",
    round_id: 2,
    question_number: 5,
    title: "Multiple Conditional Logic",
    description: "Apply grades: 90+ A, 75–89 B, 60–74 C, 40–59 D, below 40 F.",
    language: "python",
    difficulty: "Medium",
    marks: 8,
    category: "Conditional logic",
    explanation: "The broader >=60 condition must come after the >=75 condition.",
    buggy_code: `marks = 82
if marks >= 90:
    grade = "A"
elif marks >= 60:
    grade = "C"
elif marks >= 75:
    grade = "B"
elif marks >= 40:
    grade = "D"
else:
    grade = "F"
print(grade)`,
    solution_code: `marks = 82
if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 60:
    grade = "C"
elif marks >= 40:
    grade = "D"
else:
    grade = "F"
print(grade)`,
    test_cases: [
      { id: "t1", input: "marks = 82", expected_output: "B", is_hidden: false, description: "Grade for 82 is B" }
    ],
    is_active: true
  },

  // ==========================================
  // ROUND 3 — HARD: FINAL BUG HUNT
  // 3:25–3:38 PM • 3 questions • 50 marks
  // ==========================================
  {
    id: "BH-R3-Q14",
    round_id: 3,
    question_number: 1,
    title: "Palindrome Logic Bug",
    description: "Determine whether a string is a palindrome.",
    language: "python",
    difficulty: "Hard",
    marks: 12,
    category: "Palindrome / reverse traversal",
    explanation: "The string must be traversed from the last index to the first.",
    buggy_code: `text = "madam"
reverse = ""
for i in range(len(text)):
    reverse += text[i]
if text == reverse:
    print("Palindrome")
else:
    print("Not Palindrome")`,
    solution_code: `text = "madam"
reverse = ""
for i in range(len(text) - 1, -1, -1):
    reverse += text[i]
if text == reverse:
    print("Palindrome")
else:
    print("Not Palindrome")`,
    test_cases: [
      { id: "t1", input: 'text = "madam"', expected_output: "Palindrome", is_hidden: false, description: "Check madam reverse traversal" }
    ],
    is_active: true
  },
  {
    id: "BH-R3-Q15",
    round_id: 3,
    question_number: 2,
    title: "Multiple Bugs — Factorial",
    description: "Calculate the factorial of a positive integer.",
    language: "python",
    difficulty: "Hard",
    marks: 16,
    category: "Multiple bugs / factorial",
    explanation: "Factorial must start at 1 and the loop must include the input number.",
    buggy_code: `number = 5
factorial = 0
for i in range(1, number):
    factorial *= i
print(factorial)`,
    solution_code: `number = 5
factorial = 1
for i in range(1, number + 1):
    factorial *= i
print(factorial)`,
    test_cases: [
      { id: "t1", input: "number = 5", expected_output: "120", is_hidden: false, description: "5! = 120" }
    ],
    is_active: true
  },
  {
    id: "BH-R3-Q16",
    round_id: 3,
    question_number: 3,
    title: "Hidden Logical Bug — Prime Check",
    description: "Determine whether a number is prime. The solution must remain correct for prime and composite inputs.",
    language: "python",
    difficulty: "Hard",
    marks: 22,
    category: "Prime-check hidden logic",
    explanation: "The buggy code resets is_prime to True after non-dividing iterations. Once a divisor is found, the result must remain False.",
    buggy_code: `number = 29
is_prime = True
for i in range(2, number):
    if number % i == 0:
        is_prime = False
    else:
        is_prime = True
if is_prime:
    print("Prime")
else:
    print("Not Prime")`,
    solution_code: `number = 29
is_prime = True
for i in range(2, number):
    if number % i == 0:
        is_prime = False
        break
if is_prime:
    print("Prime")
else:
    print("Not Prime")`,
    test_cases: [
      { id: "t1", input: "number = 29", expected_output: "Prime", is_hidden: false, description: "29 is prime" }
    ],
    is_active: true
  }
];
