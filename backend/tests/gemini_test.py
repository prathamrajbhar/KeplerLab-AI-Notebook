from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="models/gemini-flash-lite-latest",  # ✅ CHEAPEST & FREE
    temperature=0.7,
)

response = llm.invoke([HumanMessage(content="Explain LangChain in one paragraph.")])

print(response.content)
