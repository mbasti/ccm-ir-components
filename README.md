# CCM IR-Components

## Demo
Open ```demo.html``` or [http://mbasti.github.io/ccm-ir-components/demo.html](http://mbasti.github.io/ccm-ir-components/demo.html)  in your browser for a demonstration.

## Bookmarklet
Open ```bookmarklet.html``` or [http://mbasti.github.io/ccm-ir-components/bookmarklet.html](http://mbasti.github.io/ccm-ir-components/bookmarklet.html) in your browser and drag the button into your bookmarks.

## Component Overview:
| Component    | What it does     |
| ------------- |-------------|
| ```ccm.stemmer.js``` | stemms the words from a textcorpus with a Snowball stemmer |
| ```ccm.sentence-splitter.js``` | splits the textcorpus in sentences |
| ```ccm.postagger.js``` | annotates a textcorpus with pos (part-of-speech)-tags |
| ```ccm.cooccurrence.js``` | generates from a pos-tagged textcorpus a cooccurrence/adjacency matrix |
| ```ccm.tfidf-cosine-matrix.js``` | generates from a pos-tagged textcorpus a tf-idf/adjacency matrix for documents with the cosine similarity|
| ```ccm.pagerank.js``` | generates a ranking for each node in an adjacency matrix |
| ```ccm.ranking-summary.js``` | generatres from a summary text, based on a ranking |
| ```ccm.keycloud.js``` | can be used with the cooccurrence- and pagerank-component to render keywords from a text as tagcloud|
| ```ccm.ir-pipe.js``` | used [in the bookmarklet] for selection and composition of ir-components |

## Links:
* [ccm GitHub repo (mkaul)](https://github.com/mkaul/ccm-components)
* [ccm GitHub repo (akless)](https://github.com/akless/ccm-components)
* [POS-Tag Overview](https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html)
