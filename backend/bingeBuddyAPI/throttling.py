from rest_framework.throttling import UserRateThrottle


# Deliberately generous -- exists only to stop scripted spam/abuse of a
# paid-per-call LLM endpoint, never to constrain a real subscriber's normal
# back-and-forth. Two scopes (burst + sustained) so a tight request loop is
# blocked immediately without waiting for the daily cap to catch it. See
# DEFAULT_THROTTLE_RATES in settings.py for the actual numbers.
class AICoachBurstRateThrottle(UserRateThrottle):
    scope = 'ai_coach_burst'


class AICoachSustainedRateThrottle(UserRateThrottle):
    scope = 'ai_coach_sustained'
