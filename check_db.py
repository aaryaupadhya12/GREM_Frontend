from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()
uri = os.environ.get('MONGO_URI')
if not uri:
    print('MONGO_URI not set')
    exit(1)
client = MongoClient(uri)
db = client['GREM']
print('final_metrics:', db['final_metrics'].count_documents({}))
print('demo_traces:', db['demo_traces'].count_documents({}))
print('episodic_memory:', db['episodic_memory'].count_documents({}))
