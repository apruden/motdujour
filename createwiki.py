import re
from peewee import *
from playhouse.sqliteq import SqliteQueueDatabase
from playhouse.shortcuts import model_to_dict
import logging
logger = logging.getLogger('peewee')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

db = SqliteDatabase('data/app.db')

class Word(Model):
    text = CharField()

    class Meta:
        database = db


try:
    db.create_tables([Word])
except:
    pass

words = {}

with open('data/words.txt', 'r') as f:
    for l in f.readlines():
        words[l.strip().lower().replace(' ', '_')] = 1


with open('data/wikidata.csv', 'r') as f:
    for l in f.readlines():
        parts = l.split()

        if parts[0] in ['0', '1'] and re.match(r'[a-z]', parts[1][0]) and parts[1] in words:
            Word.create(text=parts[1])
