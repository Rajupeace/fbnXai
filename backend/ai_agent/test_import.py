import time
print("STARTING IMPORT TEST...")
import os
print("OS imported.")
import sys
print("SYS imported.")
import langchain
print(f"LangChain version: {langchain.__version__}")
from langchain_community.vectorstores import FAISS
print("FAISS imported.")
from langchain_community.embeddings import HuggingFaceEmbeddings
print("HuggingFaceEmbeddings imported.")
from langchain_text_splitters import RecursiveCharacterTextSplitter
print("RecursiveCharacterTextSplitter imported.")
from langchain.chains import RetrievalQA
print("RetrievalQA imported.")
print("ALL IMPORTS SUCCESSFUL")
