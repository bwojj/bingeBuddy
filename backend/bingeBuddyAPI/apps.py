import sys
import threading

from django.apps import AppConfig


class BingebuddyapiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bingeBuddyAPI'

    def ready(self):
        is_gunicorn = 'gunicorn' in sys.argv[0]
        is_runserver = len(sys.argv) > 1 and sys.argv[1] == 'runserver'
        if not (is_gunicorn or is_runserver):
            return

        from .chatbot_utilities import get_retriever
        threading.Thread(target=get_retriever, daemon=True).start()
