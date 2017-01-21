from bottle import route, get, post, request, run, template, install, JSONPlugin, response
import time, sys, requests, urllib #.parse
import json, itertools, datetime, random

from json import JSONEncoder

from bs4 import BeautifulSoup
from peewee import *
from playhouse.sqliteq import SqliteQueueDatabase
from playhouse.shortcuts import model_to_dict
import logging

from gevent import monkey
monkey.patch_all()

logger = logging.getLogger('peewee')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

db = SqliteQueueDatabase(
    'data/app.db',
    use_gevent=True,
    autostart=True,
    queue_max_size=64,
    results_timeout=5.0)

class MyJsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
            return str(obj.strftime("%Y-%m-%d"))
        return JSONEncoder.default(self, obj)


class User(Model):
    email = CharField()

    class Meta:
        database = db


class Connection(Model):
    provider = CharField()
    provider_id = CharField()

    class Meta:
        database = db

class Registration(Model):
    data = TextField()


class Stats(Model):
    uid = IntegerField()
    date = DateField()
    day = FloatField()
    week = FloatField()
    month = FloatField()

    class Meta:
        database = db


class Entry(Model):
    date = DateField(primary_key=True)
    word = CharField()
    sourceUrl = CharField()
    description = TextField()
    question = TextField()

    class Meta:
        database = db


class Word(Model):
    text = CharField()

    class Meta:
        database = db


try:
    db.create_tables([Entry, User, Connection, Stats])
except:
    pass


@get('/api/stats/<id:int>')
def get_stats(id):
    res = [model_to_dict(s) for s in Stats.select().where(Stats.uid == id).limit(60)]
    response.content_type = 'application/json'
    return json.dumps(res, cls=MyJsonEncoder)


@post('/api/_register')
def register():
    Registration.create(data=json.dumps(request.json))


@post('/api/stats/<id:int>')
def update_stats(id):
    a = 0.3

    try:
        stats = Stats.select().where(Stats.uid == id).order_by(Stats.date.desc()).limit(1).get()
    except:
        stats = Stats(day=1, week=1, month=1)

    Stats.create(day = a * request.json['day'] + ( 1 - a) * stats.day,
            week = a * request.json['week'] + ( 1 - a) * stats.week,
            month = a * request.json['month'] + ( 1 - a) * stats.month,
            uid = id,
            date = datetime.datetime.now().date())


@route('/api/questions')
def questions():
    now = datetime.datetime.now().date()
    fro = datetime.datetime.strptime(request.query['from'], '%Y%m%d').date() if 'from' in request.query else now - datetime.datetime(30)
    res = [{'date': e.date, 'text': e.question, 'answer': e.word, 'sourceUrl': e.sourceUrl} for e in Entry.select().where(Entry.date << [now - datetime.timedelta(1), now - datetime.timedelta(7), now - datetime.timedelta(30)] & Entry.date >= fro)]
    response.content_type = 'application/json'
    return json.dumps(res, cls=MyJsonEncoder)


@route('/api/words/me')
def get_words_me():
    now = datetime.datetime.now().date()
    get_word(now)
    entry = Entry.select().where(Entry.date == now).get()

    return model_to_dict(entry)


def get_word(date):
    try:
        c = 0
        sourceUrl = None
        wordtext = None
        fr = None
        while c < 10:
            try:
                wid = random.randint(100, 1000)
                word = Word.select().where(Word.id == wid).get()
                wordtext = word.text
                sourceUrl = 'https://fr.m.wiktionary.org/w/index.php?title=%s&printable=yes' % (urllib.quote(wordtext),)
                html_doc = requests.get(sourceUrl).text
                soup = BeautifulSoup(html_doc, 'html.parser')
                fr = soup.find('span', {'id': 'fr'})
                if fr:
                    break
            except Exception, e:
                print(e)

            c += 1

        if not fr:
            raise Exception('err')

        hh = fr.find_all_previous('h2')[0]
        d = hh.find_next_sibling()

        for link in d.findAll('a'):
            link.attrs = []
            link.name = 'span'

        ol = d.find('ol')
        q = ''

        if ol:
            q = ol.find('li')
            if q:
                q.name = 'div'

        try:
            desc = str(ol)
            ques = str(q)  #q.decode('utf-8', 'ignore')
        except Exception, e:
            print(e)
            raise

        Entry.create(date=date, word=word.text, description=desc, question=ques, sourceUrl=sourceUrl)
        Entry.create(date=date - datetime.timedelta(1), word=word.text, description=desc, question=ques, sourceUrl=sourceUrl)
        Entry.create(date=date - datetime.timedelta(7), word=word.text, description=desc, question=ques, sourceUrl=sourceUrl)
        db.commit()

    except Exception as e:
        print(e)


install(JSONPlugin(json_dumps=lambda s: json.dumps(s, cls=MyJsonEncoder)))
run(host='0.0.0.0', port='8999', server='gevent')
