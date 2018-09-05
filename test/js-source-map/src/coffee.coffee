for i in [1..3]
  console.log("direct", i)

(borschik.include("./f.js"))("whatever")

if true
  console.log('always')

link = borschik.link("./f.js")

double = (x) =>
  x + x

console.log(double("borschik:include:./b.js"))

for i in [2..-1]
  console.log("reversed", i)

borschik.include("./c.js")

die()
