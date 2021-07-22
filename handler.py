import json
from selenium import webdriver
import pandas as pd

def FirstServerless(event, context):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-software-rasterizer')
    
    site = 'http://tsmarketing.in/DailyArrivalsnPricesCommoditywise.aspx'
    
    wd = webdriver.Chrome('chromedriver',options=options)
    wd.get(site)
    
    html = wd.page_source
    
    df = pd.read_html(html)

    response = {
        "statusCode": 200,
        "body": json.loads(df[0].to_json())
    }

    return response

    # Use this code if you don't use the http event with the LAMBDA-PROXY
    # integration
    """
    return {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "event": event
    }
    """
