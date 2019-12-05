# from http.server import HTTPServer, BaseHTTPRequestHandler

# from io import BytesIO
import re
import scrapy
import json
from scrapy.crawler import CrawlerProcess

import subprocess
from multiprocessing import Process, Queue
import functools
import threading

import crochet
crochet.setup()  # initialize crochet before further imports

from flask import Flask, jsonify
from scrapy import signals
from scrapy.crawler import CrawlerRunner
from scrapy.signalmanager import dispatcher

from flask import Flask, render_template, request
app = Flask(__name__)

source_dict = {}

crawl_runner = CrawlerRunner()

"""
accepts a html tag string and returns a dict
where keys: tag_name - a tag name, raw_tag - a raw tag value
"""
def getTagData(str):
    match_res = re.search('^[<](.+?)[>\s]', str)
    if match_res is not None:
        return { "tag_name": match_res.group(1), "raw_tag": str }
    else:
        return str

@crochet.wait_for(timeout=60.0)
def scrape_with_crochet(urls):
    # signal fires when single item is processed
    # and calls _crawler_result to append that item
    dispatcher.connect(_crawler_result, signal=signals.item_scraped)
    eventual = crawl_runner.crawl(PageSpider, urls)
    return eventual  # returns a twisted.internet.defer.Deferred


def _crawler_result(item, response, spider):
    """
    We're using dict() to decode the items.
    Ideally this should be done using a proper export pipeline.
    """
    print(2222)
    print(dict(item))


class PageSpider(scrapy.Spider):
    name = 'pageSpider'

    custom_settings = {
        'LOG_LEVEL': 'INFO'
        # 'LOG_LEVEL': 'DEBUG'
    }

    # def __init__(self, urlList):
    #    self.urls = urlList
    #    print('self.urls =>' % self.url_lists)

    def start_requests(self):
        urls = [
            'https://korrespondent.net/ukraine/4165015-kabmyn-uvelychyt-buidzhet-fonda-sotsstrakhovanyia',
            'https://elogic.co/blog/how-to-optimize-images-in-magento-your-starter-kit-for-faster-web-pages/'
            'file:///Users/cronix-23-z-tan/back/seo-reporter/quotes-ukraine.html'
        ]

        print(self.urls)

        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        page = response.url.split('/')[-2]
        filename = 'quotes-%s.html' % page
        res = response.css('h1, h2, h3, h4, h5, h6').getall()
        
        # print(res)
        #print('source_dict -> %s' % source_dict)
        tag_data_list = list(map(getTagData, res))

        source_dict[response.url] = tag_data_list
        # print('source_dict -> %s' % source_dict)

        #print('--- start result ---')
        #print('\n'.join(list(cleaned_res)))
        #print('--- end result ---')
        with open(filename, 'wb') as f:
            f.write(response.body)
        self.log('Saved file %s' % filename)

def runSpider(urls):
    process = CrawlerProcess({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:45.0) Gecko/20100101 Firefox/45.0'
    })
    process.crawl(PageSpider, urls=urls)
    process.start()

    

    
    print('finished parsing')
"""
class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        #self.wfile.write(b'Hello, world')
        self.wfile.write(json.dumps(source_dict).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        self.send_response(200)
        self.end_headers()
        response = BytesIO()
        response.write(b'This is POST request. ')
        response.write(b'Received: ')
        response.write(body)
        self.wfile.write(response.getvalue())
"""

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/get-parsed-data')
def get_parsed_data():
    return json.dumps(source_dict)

@app.route('/explore-pages-seo', methods=['POST'])
def explore_pages_seo():
    print('request url -> {0}'.format(request.data))
    payload = json.loads(request.data)
    urls = list(payload['urls'].values())

    # TODO: returns data
    # runSpider(urls)

    scrape_with_crochet(urls)
        

    return json.dumps(source_dict)


def main():
    print("hello main")

    
    # getTagName('some')

    #httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)

    # runSpider()

    app.run(debug=True)
    

    print('server is running')
    #httpd.serve_forever()



if __name__ == '__main__':
    main()