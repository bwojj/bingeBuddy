import sys
import threading

from django.apps import AppConfig


class BingebuddyapiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bingeBuddyAPI'

    def ready(self):
        # Only warm the AI coach retriever for processes that will actually serve
        # requests (gunicorn in prod, `runserver` locally) -- skip management
        # commands like migrate/test/makemigrations, which also trigger ready()
        # but shouldn't pay for a model download/load they don't need.
        is_gunicorn = 'gunicorn' in sys.argv[0]
        is_runserver = len(sys.argv) > 1 and sys.argv[1] == 'runserver'
        if not (is_gunicorn or is_runserver):
            return

        from .chatbot_utilities import get_retriever
        # HuggingFaceEmbeddings loads all-MiniLM-L6-v2 lazily on first use, which
        # costs a few seconds -- run it in a background thread at boot so that
        # cost lands here instead of inside the first user's ai_coach request
        # after a deploy/restart. get_retriever() is lock-guarded, so a request
        # arriving mid-warmup just waits for this to finish rather than seeing a
        # spurious "unavailable" result.
        threading.Thread(target=get_retriever, daemon=True).start()
