from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate, MessagesPlaceholder
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
prompt = ChatPromptTemplate.from_messages([system_prompt, MessagesPlaceholder(variable_name="history"), user_prompt])

# defines chain for the llm 
chain = prompt | llm