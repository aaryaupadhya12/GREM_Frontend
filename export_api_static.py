import os, json
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI')
if not MONGO_URI:
    print('MONGO_URI not set')
    exit(1)

client = MongoClient(MONGO_URI)
db = client['GREM']

os.makedirs('public/api', exist_ok=True)

metrics = db['final_metrics'].find_one({})
if metrics:
    metrics.pop('_id', None)
    with open('public/api/metrics', 'w', encoding='utf-8') as f:
        json.dump({'success': True, 'data': metrics}, f)
else:
    with open('public/api/metrics', 'w', encoding='utf-8') as f:
        json.dump({'success': False, 'error': 'No metrics found'}, f)

traces = list(db['demo_traces'].find().sort('demo_id', 1).limit(5))
for t in traces:
    t.pop('_id', None)
with open('public/api/demo-traces', 'w', encoding='utf-8') as f:
    json.dump({'success': True, 'data': traces}, f)

chains = list(db['episodic_memory'].find({'q_final': {'$gte': 0.7}}, {'_id':0, 'query':1, 'failure_mode':1, 'q_final':1}).sort('_id', -1).limit(10))
with open('public/api/recent-chains', 'w', encoding='utf-8') as f:
    json.dump({'success': True, 'data': chains}, f)

print('Wrote public/api/metrics, demo-traces, recent-chains')
