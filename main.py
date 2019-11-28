from http.server import HTTPServer, BaseHTTPRequestHandler

from io import BytesIO
import re
import scrapy
import json
from scrapy.crawler import CrawlerProcess

from flask import Flask, render_template
app = Flask(__name__)



source_dict = {}

def getTagName(str):
    match_res = re.search('^[<](.+?)[>\s]', str)
    if match_res is not None:
        return match_res.group(1)
    else:
        return str

class PageSpider(scrapy.Spider):
    name = 'pageSpider'

    custom_settings = {
        'LOG_LEVEL': 'DEBUG'
    }

    # def __init__(self, urlList):
    #    self.url_list = urlList
    #    print('self.url_list =>' % self.url_lists)

    def start_requests(self):
        urls = [
            'https://korrespondent.net/ukraine/4165015-kabmyn-uvelychyt-buidzhet-fonda-sotsstrakhovanyia',
            'https://elogic.co/blog/how-to-optimize-images-in-magento-your-starter-kit-for-faster-web-pages/'
            # 'file:///Users/cronix-23-z-tan/back/seo-reporter/quotes-ukraine.html'
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        page = response.url.split('/')[-2]
        filename = 'quotes-%s.html' % page
        res = response.css('h1, h2, h3, h4, h5, h6').getall()
        source_dict[response.url] = res
        print(res)
        print('source_dict -> %s' % source_dict)
        #cleaned_res = map(getTagName, res)
        #print('--- start result ---')
        #print('\n'.join(list(cleaned_res)))
        #print('--- end result ---')
        with open(filename, 'wb') as f:
            f.write(response.body)
        self.log('Saved file %s' % filename)

def runSpider():
    process = CrawlerProcess({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:45.0) Gecko/20100101 Firefox/45.0'
    })
    process.crawl(PageSpider)
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


def main():
    print("hello main")

    runSpider()
    # getTagName('some')

    #httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)

    app.run(debug=True)

    print('server is running')
    #httpd.serve_forever()



if __name__ == '__main__':
    main()