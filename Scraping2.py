from selenium import webdriver;
from bs4 import BeautifulSoup;
import pandas as pd;

def scrape(url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    
    site = url
    
    wd = webdriver.Chrome('chromedriver',options=options)
    wd.get(site)
    
    html = wd.page_source
    
    df = pd.read_html(html)
    
    return df[0]

scrape('http://tsmarketing.in/DailyArrivalsnPricesCommoditywise.aspx')    