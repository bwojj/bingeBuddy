from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import os

# defines LLM 
llm = ChatGoogleGenerativeAI(
    model='gemini-2.5-flash',
    temperature=0.7,
    google_api_key=os.environ.get('GOOGLE_API_KEY'),
    timeout=15.0,
)

        # defines system prompt 
system_prompt = SystemMessagePromptTemplate.from_template(
    """
        You are an AI binge eating coach placed within a Binge Eating Recovery app, that 
        is focused on the beating the urge mindset, meaning the main vehicle to stop users 
        from binge eating is to help them stop the urge. The main components are all mindset 
        related. Users might ask questions for reassurance, help to beat an urge, or more. The 
        mindset shifts you need to point to include the following: understand that the user has 
        full control, the user only eats as a conscious decision, the binge eating goes against 
        the users goal, the user should NOT refer to themselves as a binge eater. Beyond that be 
        a helpful, and very sympathetic therapist for the user. Always be 100% kind. 
    """
)
user_prompt = HumanMessagePromptTemplate.from_template("{message}")

# defines full prompt template to use 
prompt = ChatPromptTemplate.from_messages([system_prompt, MessagesPlaceholder(variable_name="history"), MessagesPlaceholder(variable_name="context"), user_prompt])

# defines chain for the llm 
chain = prompt | llm


 # defines loader to load directory markdown files
RAG_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_data")

loader = DirectoryLoader(
    path=RAG_DATA_DIR,
    glob="*.md",
    loader_cls=TextLoader,
    loader_kwargs={'encoding':'utf-8'}
)

# loads the docs
docs = loader.load()

# splits the documents into chunks 
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800, # chunks are 800 character each
    chunk_overlap=50, # chunks can contain same 50 characters, some chunks with similar data to others 
)

# create chunks 
chunks = splitter.split_documents(docs)

# creates embeddings of the documents with hugging face model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# creates database to hold the embeddings 
vectorstore = Chroma.from_documents(
    documents=chunks, 
    embedding=embeddings, 
    persist_directory='./ai_coach_db',
    collection_name='ai_coach_collection'
)

# defines retriever to retrieve 5 most similar answers 
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

