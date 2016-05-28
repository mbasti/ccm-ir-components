# CCM IR-Components

## Demo
Open ```demo.html``` in your browser for a demonstration of the componentss.

## Component Overview:
| Component    | What it does     |
| ------------- |-------------|
| ```ccm.postagger.js``` | annotates a textcorpus with pos (part-of-speech)-tags |
| ```ccm.cooccurrence.js``` | generates from a pos-tagged textcorpus a cooccurrence/adjacency matrix |
| ```ccm.tfidf.js``` | generates from a textcorpus a tf-idf/adjacency matrix |
| ```ccm.pagerank.js``` | generates a ranking for each node in an adjacency matrix |

## TODO:
* merge-terms-when-adjacent functionality
* consider plural/singular
* consider verbs (selectable/parameter for cooccurrence component)?
* remove "empty" terms for less space in cooccurrence matrix
* sort pagerank output
* refactoring
* finish tf-idf component
* summary component
* Bookmarklet?
* Side-Panel?

## Links:
* [ccm GitHub repo (mkaul)](https://github.com/mkaul/ccm-components)
* [ccm GitHub repo (akless)](https://github.com/akless/ccm-components)
* [POS-Tag Overview](https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html)
