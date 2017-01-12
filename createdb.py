from lxml import etree
import json

words = set()
context = etree.iterparse('data/wordnet.xml', events=('end',), tag='LITERAL')

for event, elem in context:
    #print('%s\n' % elem.text)
    words.add(elem.text)
    # It's safe to call clear() here because no descendants will be accessed
    elem.clear()
    # Also eliminate now-empty references from the root node to <Title> 
    while elem.getprevious() is not None:
        del elem.getparent()[0]

del context

with open('words.txt', 'w') as f:
#    json.dump(list(words), f)
    f.writelines(list(map(lambda x: '%s\n' % x, filter(None, list(words)))))

print('>>>> %s' % len(words))
