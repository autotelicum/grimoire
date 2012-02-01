% Polyglot
% 
% ☕

> This literate program is _interactive_ in its HTML~5~ form. Edit a code segment to try it.


## The Polyglot Tower of Babel

Speaking in many tongues. As in: "1 … 2 … many!" and only as long as those are CoffeeScript, JavaScript, and Scheme (SICP meta-circular dialect).


##### Definitions

Define some variable names that can be shared between code blocks.

~~~~ {.coffeescript}
@globalNames = "x y n"
~~~~

Initialize some default values for the purpose of testing.

~~~~ {.coffeescript}
show [x, y] = [5, 2]
~~~~

##### CoffeeScript

~~~~ {.coffeescript}
y += view if x is 5 then 7 else 9
~~~~

##### JavaScript

~~~~ {.javascript}
if (x === 5) { y += view(7); } else { y += view(9); }
~~~~

##### Scheme

~~~~ {.scheme}
(set! y (+ y (view (if (= x 5) 7 9))))
y
~~~~

##### Test

~~~~ {.coffeescript}
show "#{x + y} # Expected 28"
~~~~

##### Scheme variant of 'Hello World!'

~~~~ {.scheme}
(define (factorial n)
  (if (= n 1)
    1
    (* (factorial (- n 1)) n)))
(define n x)
(set! n (factorial n))
n
~~~~

##### CoffeeScript

~~~~ {.coffeescript}
show "Factorial of #{x} is #{n} # Expected 120"
~~~~

-----------------------------------------------------------------------------

<!--
Formats [Markdown](http://autotelicum.github.com/Smooth-CoffeeScript/interactive/polyglot.md) [PDF](http://autotelicum.github.com/Smooth-CoffeeScript/interactive/polyglot.pdf) [HTML](http://autotelicum.github.com/Smooth-CoffeeScript/interactive/polyglot.html)
-->

License [Creative Commons Attribution Share Alike](http://creativecommons.org/licenses/by-sa/3.0/)
by autotelicum © 2555/2012

<!-- Formatting commands for acme using ssam & pandoc:
Edit ,>pandoc -f markdown -t html -S -5 --mathml --section-divs --css pandoc-template.css --css codemirror/codemirror.css --css codemirror/pantheme.css --template pandoc-template.html -B grimoire-output.html | ssam 's/(<code class="sourceCode [cC]offee[sS]cript")/\1 contenteditable=\"true\" spellcheck=\"false\"/g' | ssam 's/(<code class="sourceCode [jJ]ava[sS]cript")/\1 contenteditable=\"true\" spellcheck=\"false\"/g' | ssam 's/(<code class="sourceCode [sS]cheme")/\1 contenteditable=\"true\" spellcheck=\"false\"/g' | ssam 's/(<section id="view-solution[0-9\-]*")(>)(\n.*\n)(<section id="section[0-9\-]*")(>)/\1 onclick=\"reveal(this)\" \2\3\4 style=\"display:none\" \5/g' | ssam 's/<img src=\"[^\"]+\" alt=\"[^\"]+\" \/>/<canvas id=\"drawCanvas\" width=\"320\" height=\"320\" style=\"position: absolute; top: 333px; left: 200px\"><\/canvas>/' | ssam 's/(<p)(><img)/\1 align=center\2/g' >polyglot.html; open polyglot.html; plumb polyglot.html
|tr A-Z a-z |tr a-z A-Z |fmt |a+ |a-

Edit ,x/^~~+[   ]*{\.[cC]offee[sS]cript.*}$/+,/^~~+$/-p
Edit ,x/^~~+[   ]*{\.[jJ]ava[sS]cript.*}$/+,/^~~+$/-p
Edit ,x/^~~+[   ]*{\.[sS]cheme.*}$/+,/^~~+$/-p

Edit ,>ssam -n 'x/^~~+[   ]*{\.[cC]offee[sS]cript.*}$/+,/^~~+$/-' |cat embed-standalone.coffee - |tee polyglot.coffee | coffee -cs >polyglot.js; coffee polyglot.coffee >polyglot.output; plumb polyglot.output
Edit ,>markdown2pdf --listings --xetex '--template=pandoc-template.tex' -o polyglot.pdf; open polyglot.pdf
-->
