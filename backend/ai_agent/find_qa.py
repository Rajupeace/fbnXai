locations = [
    "langchain.chains",
    "langchain_community.chains",
    "langchain.chains.retrieval_qa.base",
]

for loc in locations:
    try:
        print(f"Testing {loc}...")
        mod = __import__(loc, fromlist=['RetrievalQA'])
        if hasattr(mod, 'RetrievalQA'):
            print(f"   FOUND RetrievalQA in {loc}")
        else:
            print(f"   Module {loc} found, but no RetrievalQA")
    except Exception as e:
        print(f"   FAILED in {loc}: {e}")

try:
    from langchain.chains import RetrievalQA
    print("Direct import SUCCESS")
except Exception as e:
    print(f"Direct import FAILED: {e}")
