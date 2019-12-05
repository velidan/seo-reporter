import scrapy
import re

# result dictionary
result = {}

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

class SeoSpider(scrapy.Spider):
    name = 'seo_spider'

    def __init__(self, urls):
        self.start_urls = urls

    def parse(self, response):
        # page = response.url.split('/')[-2]
        res = response.css('h1, h2, h3, h4, h5, h6').getall()
        
        tag_data_list = list(map(getTagData, res))

        result[response.url] = tag_data_list

        return result

    # def parse(self, response):
    #     for quote in response.xpath('//div[@class="quote"]'):
    #         return MyItem(
    #             text=quote.xpath('./span[@class="text"]/text()').extract_first(),
    #             author=quote.xpath('.//small[@class="author"]/text()').extract_first())

    #     next_page_url = response.xpath('//li[@class="next"]/a/@href').extract_first()
    #     if next_page_url is not None:
    #         return scrapy.Request(response.urljoin(next_page_url))