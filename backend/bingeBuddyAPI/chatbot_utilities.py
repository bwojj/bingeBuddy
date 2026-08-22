import logging
import os
import threading
import chromadb
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

CHROMA_COLLECTION_NAME = os.environ.get("CHROMA_COLLECTION_NAME", "ai-coach-collection")


EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# RAG_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_data")
# AI_COACH_DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_coach_db")

_retriever = None
_retriever_initialized = False
# Guards initialization
_retriever_lock = threading.Lock()


def get_retriever():
    # Connects to the existing hosted chroma collection
    global _retriever, _retriever_initialized
    if _retriever_initialized:
        return _retriever

    with _retriever_lock:
        if _retriever_initialized:
            return _retriever

        try:
            chroma_client = chromadb.HttpClient(
                host=os.environ.get("CHROMA_URL"),
                port=os.environ.get("CHROMA_PORT"),
                ssl=True,
            )
            embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
            vectorstore = Chroma(
                client=chroma_client,
                collection_name=CHROMA_COLLECTION_NAME,
                embedding_function=embeddings,
                create_collection_if_not_exists=False,
            )

            # Ingestion - disabled
            #
            # loader = DirectoryLoader(
            #     path=RAG_DATA_DIR,
            #     glob="*.md",
            #     loader_cls=TextLoader,
            #     loader_kwargs={'encoding': 'utf-8'}
            # )
            # docs = loader.load()
            #
            # splitter = RecursiveCharacterTextSplitter(
            #     chunk_size=800, # chunks are 800 character each
            #     chunk_overlap=50, # chunks can contain same 50 characters, some chunks with similar data to others
            # )
            # chunks = splitter.split_documents(docs)
            #
            # # The remote Chroma collection persists across deploys/restarts, and without
            # # explicit ids, add_documents() assigns a fresh random uuid to every chunk on
            # # every call -- so re-running this on restart would duplicate every existing
            # # chunk. Deriving each chunk's id from its source file + content instead makes
            # # the same chunk hash to the same id every time, so we can diff against what's
            # # already stored and add only genuinely new/changed chunks.
            # chunk_ids = [
            #     hashlib.sha256(f"{chunk.metadata.get('source', '')}::{chunk.page_content}".encode('utf-8')).hexdigest()
            #     for chunk in chunks
            # ]
            # existing_ids = set(vectorstore._collection.get(ids=chunk_ids, include=[])['ids']) if chunk_ids else set()
            # new_chunks, new_ids = [], []
            # for chunk, chunk_id in zip(chunks, chunk_ids):
            #     if chunk_id not in existing_ids:
            #         new_chunks.append(chunk)
            #         new_ids.append(chunk_id)
            #
            # if new_chunks:
            #     vectorstore.add_documents(new_chunks, ids=new_ids)
            # --- end ingestion ---

            _retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        except Exception:
            logger.exception("Failed to initialize AI coach retriever; ai_coach endpoint will be unavailable")
            _retriever = None
        finally:
            _retriever_initialized = True

    return _retriever



llm = ChatGoogleGenerativeAI(
    model='gemini-3.1-flash-lite',
    temperature=0.7,
    google_api_key=os.environ.get('GOOGLE_API_KEY'),
    thinking_level='minimal',
    timeout=15.0,
    max_retries=2,
)


system_prompt = SystemMessagePromptTemplate.from_template(
    """
        You are an AI binge eating coach placed within a Binge Eating Recovery app, that
        is focused on the beating the urge mindset, meaning the main vehicle to stop users
        from binge eating is to help them stop the urge. The main components are all mindset
        related. The mindset shifts you need to point to include the following: understand that the user has
        full control, the user only eats as a conscious decision, the binge eating goes against
        the users goal, the user should NOT refer to themselves as a binge eater. Beyond that be
        a helpful therapist for the user. Refer to the users coaching style to adjust
        the answers. The users question
        will be fed to a RAG pipleine to give you the following context, reply based directly on the RAG, using
        your previous training for formatting exc. The RAG might mention other names, however do not mention any source under
        any circumstances.  

        If the user's prompt has absolutely nothing to do with binge eating OR mental health or anything in that sort, 
        tell the user that your purpose is to help with their binge eating AND mental health. If it cannot relate to mental health, tell the user that is not your purpose. 

        Try to keep messages as short and concise as possible 

        

        Context: {context}

        Coaching_Style: {coaching_style}

        User-Memory: {user_memory}
    """
)
user_prompt = HumanMessagePromptTemplate.from_template("{message}")


prompt = ChatPromptTemplate.from_messages([system_prompt, MessagesPlaceholder(variable_name="history"), user_prompt])


chain = prompt | llm


system_title_prompt = SystemMessagePromptTemplate.from_template(
    """
        You are tasked to generate a session title based on the users first message which has been inputted to you. 
        Return a title for the session in 3-6 words, DO NOT GO ABOVE THAT WORD COUNT
    """
)

title_prompt = ChatPromptTemplate.from_messages([system_title_prompt, user_prompt])

session_chain = title_prompt | llm
