import scrapy
import re

# result dictionary
result = {}

class SeoSpider(scrapy.Spider):
    name = 'seo_spider'

    def __init__(self, urls):
        result.clear()
        self.start_urls = urls

    def parse(self, response):
        res = response.css('h1, h2, h3, h4, h5, h6').getall()
        
        tag_data_list = list(map(getTagData, res))

        result[response.url] = tag_data_list

        return result


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