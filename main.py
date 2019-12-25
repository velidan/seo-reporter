import crochet
crochet.setup()  # initialize crochet before further imports

from scrapy import signals
from scrapy.crawler import CrawlerRunner
from scrapy.signalmanager import dispatcher

import json
from flask import Flask, render_template, request

import os, sys
from spider import SeoSpider
import re

base_dir = '.'
if hasattr(sys, '_MEIPASS'):
    base_dir = os.path.join(sys._MEIPASS)

app = Flask(__name__,
        static_folder=os.path.join(base_dir, 'static'),
        template_folder=os.path.join(base_dir, 'templates'))
crawl_runner = CrawlerRunner()

# a parsing result obj that will be send to the client
source_dict = {}


@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/get-parsed-data')
def get_parsed_data():
    return json.dumps(source_dict)


@app.route('/explore-pages-seo', methods=['POST'])
def explore_pages_seo():
    # run crawler in twisted reactor synchronously
    payload = json.loads(request.data)
    urls_str = payload['urls']

    # could contain spaces etc.
    dirty_url_list = re.findall("(?:http[s]:\/\/)(?:(?!http[s]?:\/\/).)*", urls_str)
    urls = [ x.rstrip() for x in dirty_url_list ]

    

    # a crutch. As it's a subprocess call 
    # it doesn't return anything but it's
    # just a fill the shared variable by result 
    scrape_with_crochet(urls)
    
    return source_dict


@crochet.wait_for(timeout=60.0)
def scrape_with_crochet(urls):
    # signal fires when single item is processed
    # and calls _crawler_result to append that item
    dispatcher.connect(_crawler_result, signal=signals.item_scraped)
    eventual = crawl_runner.crawl(SeoSpider, urls)
    return eventual


def _crawler_result(item, response, spider):
    """
    We're using dict() to decode the items.
    Ideally this should be done using a proper export pipeline.
    """
    item_keys = item.keys()
    for i in item_keys:
        source_dict[ i ] = item[ i ]


if __name__=='__main__':
    app.run(debug=True)