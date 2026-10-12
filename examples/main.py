from turtle import *

side = int(input('Длина стороны: '))
for _ in range(4):
    forward(side)
    left(90)

with open('numbers.txt', encoding='utf-8') as source:
    numbers = [int(line) for line in source]
with open('result.txt', 'w', encoding='utf-8') as result:
    result.write(str(sum(numbers)))
print('Сумма:', sum(numbers))
done()
