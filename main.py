import crochet
crochet.setup()  # initialize crochet before further imports

from flask import Flask, jsonify
from scrapy import signals
from scrapy.crawler import CrawlerRunner
from scrapy.signalmanager import dispatcher

import spiders

import json
from flask import Flask, render_template, request

import os, sys

base_dir = '.'
if hasattr(sys, '_MEIPASS'):
    base_dir = os.path.join(sys._MEIPASS)

app = Flask(__name__,
        static_folder=os.path.join(base_dir, 'static'),
        template_folder=os.path.join(base_dir, 'templates'))
output_data = []
crawl_runner = CrawlerRunner()
# crawl_runner = CrawlerRunner(get_project_settings()) if you want to apply settings.py
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
    # print('request url -> {0}'.format(request.data))
    payload = json.loads(request.data)
    urls = list(payload['urls'].values())

    # a crutch. As it's a subprocess call 
    # it doesn't return anything but it's
    # just a fill the shared variable by result 
    scrape_with_crochet(urls)

    return source_dict
    # return jsonify(output_data[0])


@crochet.wait_for(timeout=60.0)
def scrape_with_crochet(urls):
    # signal fires when single item is processed
    # and calls _crawler_result to append that item
    dispatcher.connect(_crawler_result, signal=signals.item_scraped)
    eventual = crawl_runner.crawl(
        spiders.SeoSpider, urls)
    return eventual  # returns a twisted.internet.defer.Deferred


def _crawler_result(item, response, spider):
    """
    We're using dict() to decode the items.
    Ideally this should be done using a proper export pipeline.
    """
    item_keys = item.keys()
    for i in item_keys:
        source_dict[ i ] = item[ i ]


    # item_value = item[ item_key ]
    output_data.append(dict(item))


if __name__=='__main__':
    app.run(debug=True)