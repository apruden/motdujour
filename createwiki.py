import re
from peewee import *
from playhouse.sqliteq import SqliteQueueDatabase
from playhouse.shortcuts import model_to_dict
import logging
logger = logging.getLogger('peewee')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

db = SqliteQueueDatabase(
    'app.db',
    use_gevent=True,
    autostart=True,
    queue_max_size=64,
    results_timeout=5.0)

class Word(Model):
    text = CharField()

    class Meta:
        database = db


try:
    db.create_tables([Word])
except:
    pass


with open('wikidata.csv', 'r') as f:
    for l in f.readlines():
        parts = l.split()
        if parts[0] in ['0', '1'] and re.match(r'[a-z]', parts[1][0]):
            Word.create(text=parts[1])
