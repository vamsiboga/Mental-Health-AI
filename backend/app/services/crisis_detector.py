import logging
from typing import Tuple, List
from app.config import settings

logger = logging.getLogger(__name__)

CRISIS_RESOURCES = [
    "988 Suicide and Crisis Lifeline: Call or text 988 (available 24/7)",
    "Crisis Text Line: Text HOME to 741741 (free and confidential)",
    "SAMHSA National Helpline: 1-800-662-4357 (free, confidential, 24/7)",
    "International Crisis Centers: https://www.iasp.info/resources/Crisis_Centres/",
    "Emergency Services: Call 911 if there is immediate danger"
]

CRISIS_PHRASES = [
    "want to die", "want to kill myself", "thinking about suicide",
    "end my life", "ending my life", "no point in living", "better off dead",
    "going to hurt myself", "plan to kill", "goodbye forever",
    "can't go on", "nothing to live for", "take my own life",
    "would be better off without me", "don't want to be here anymore",
    "wish i was dead", "thinking of ending it"
]


class CrisisDetector:
    def __init__(self):
        self.keyword_list = settings.crisis_keywords_list
        self.extended_phrases = CRISIS_PHRASES

    def detect(self, text: str) -> Tuple[bool, List[str]]:
        text_lower = text.lower()
        triggered = []

        for keyword in self.keyword_list:
            if keyword.lower() in text_lower:
                triggered.append(keyword)

        for phrase in self.extended_phrases:
            if phrase.lower() in text_lower:
                triggered.append(phrase)

        is_crisis = len(triggered) > 0
        if is_crisis:
            logger.warning(f"CRISIS DETECTED - triggers found: {triggered}")

        return is_crisis, CRISIS_RESOURCES if is_crisis else []

    def get_crisis_system_prompt_addition(self) -> str:
        return """
CRITICAL SAFETY INSTRUCTION - READ CAREFULLY:
If the patient expresses any thoughts of suicide, self-harm, or harming others you MUST:
1. Acknowledge their pain with genuine empathy and compassion
2. Take their statement seriously and never minimize or dismiss it
3. Immediately provide crisis resources including the 988 Lifeline and Crisis Text Line
4. Strongly encourage them to reach out to their care team or emergency services immediately
5. Never provide any information that could facilitate self-harm in any way
6. Always err strongly on the side of caution and recommend professional help
7. Remind the clinician to conduct a full C-SSRS suicide risk assessment immediately
"""


crisis_detector = CrisisDetector()
