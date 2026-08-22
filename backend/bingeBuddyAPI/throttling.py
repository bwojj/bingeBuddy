from rest_framework.throttling import UserRateThrottle


# Deliberately generous - stops abuse
class AICoachBurstRateThrottle(UserRateThrottle):
    scope = 'ai_coach_burst'


class AICoachSustainedRateThrottle(UserRateThrottle):
    scope = 'ai_coach_sustained'
