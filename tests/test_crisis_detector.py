import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

os.environ.setdefault("OPENAI_API_KEY", "sk-test-key-for-testing-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("FAISS_INDEX_PATH", "./test_faiss_index")
os.environ.setdefault("DOCUMENTS_PATH", "./app/data/clinical_docs")
os.environ.setdefault("CRISIS_KEYWORDS", "suicide,self-harm,kill myself,end my life,hurt myself")

from app.services.crisis_detector import CrisisDetector


def make_detector():
    return CrisisDetector()


def test_no_crisis_normal_text():
    detector = make_detector()
    detected, resources = detector.detect("I have been feeling anxious lately and having trouble sleeping.")
    assert detected is False
    assert len(resources) == 0


def test_no_crisis_general_sadness():
    detector = make_detector()
    detected, resources = detector.detect("I feel sad and unmotivated most days this week.")
    assert detected is False


def test_crisis_keyword_suicide():
    detector = make_detector()
    detected, resources = detector.detect("The patient mentioned suicide during the session.")
    assert detected is True
    assert len(resources) > 0


def test_crisis_keyword_self_harm():
    detector = make_detector()
    detected, resources = detector.detect("Patient is engaging in self-harm behaviors.")
    assert detected is True


def test_crisis_phrase_end_my_life():
    detector = make_detector()
    detected, resources = detector.detect("I want to end my life tonight.")
    assert detected is True


def test_crisis_phrase_want_to_die():
    detector = make_detector()
    detected, resources = detector.detect("I want to die and feel hopeless.")
    assert detected is True


def test_crisis_phrase_nothing_to_live_for():
    detector = make_detector()
    detected, resources = detector.detect("I feel like there is nothing to live for anymore.")
    assert detected is True


def test_crisis_case_insensitive():
    detector = make_detector()
    detected, resources = detector.detect("PATIENT IS THINKING ABOUT SUICIDE")
    assert detected is True


def test_crisis_resources_include_988():
    detector = make_detector()
    detected, resources = detector.detect("I am thinking about suicide.")
    assert detected is True
    assert any("988" in r for r in resources)


def test_crisis_resources_include_text_line():
    detector = make_detector()
    detected, resources = detector.detect("I want to kill myself.")
    assert detected is True
    assert any("741741" in r for r in resources)


def test_crisis_resources_include_samhsa():
    detector = make_detector()
    detected, resources = detector.detect("I have been thinking about ending my life.")
    assert detected is True
    assert any("SAMHSA" in r or "662" in r for r in resources)


def test_crisis_system_prompt_returns_string():
    detector = make_detector()
    prompt = detector.get_crisis_system_prompt_addition()
    assert isinstance(prompt, str)
    assert len(prompt) > 0


def test_crisis_system_prompt_contains_988():
    detector = make_detector()
    prompt = detector.get_crisis_system_prompt_addition()
    assert "988" in prompt


def test_no_crisis_returns_empty_resources():
    detector = make_detector()
    detected, resources = detector.detect("Patient is doing well and feeling positive.")
    assert detected is False
    assert resources == []
