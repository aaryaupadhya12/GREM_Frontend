from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json
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

# Check structure
print('\n--- demo_traces structure ---')
doc = db['demo_traces'].find_one()
if doc:
    print(f'Keys: {list(doc.keys())}')

print('\n--- episodic_memory structure ---')
doc = db['episodic_memory'].find_one()
if doc:
    print(f'Keys: {list(doc.keys())}')
    for key in ['q_final', 'failure_mode', 'query']:
        if key in doc:
            print(f'  {key}: exists')
        else:
            print(f'  {key}: MISSING')

print('\n--- final_metrics structure ---')
doc = db['final_metrics'].find_one()
if doc:
    doc_copy = doc.copy()
    doc_copy.pop('_id', None)
    print(f'Keys: {list(doc_copy.keys())}')
