import sys
import os

print(f"Python: {sys.version}")

def check_one(name, import_path):
    try:
        print(f"Testing {name}...")
        __import__(import_path)
        print(f"   SUCCESS")
        return True
    except Exception as e:
        print(f"   FAILED: {e}")
        return False

deps = [
    ("FAISS", "langchain_community.vectorstores"),
    ("Embeddings", "langchain_community.embeddings"),
    ("Splitters", "langchain_text_splitters"),
    ("Chains", "langchain.chains"),
    ("Gemini", "langchain_google_genai")
]

all_ok = True
for name, path in deps:
    if not check_one(name, path):
        all_ok = False

if all_ok:
    print("\nALL SYSTEM DEPENDENCIES VERIFIED!")
else:
    print("\nSOME DEPENDENCIES ARE MISSING.")
    sys.exit(1)
