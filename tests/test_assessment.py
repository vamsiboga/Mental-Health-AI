import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

os.environ.setdefault("OPENAI_API_KEY", "sk-test-key-for-testing-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("FAISS_INDEX_PATH", "./test_faiss_index")
os.environ.setdefault("DOCUMENTS_PATH", "./app/data/clinical_docs")
os.environ.setdefault("CRISIS_KEYWORDS", "suicide,self-harm,kill myself,end my life,hurt myself")

from app.services.assessment_service import assessment_service


def test_phq9_minimal_score():
    responses = {str(i): 0 for i in range(1, 10)}
    result = assessment_service.score_phq9(responses)
    assert result.total_score == 0
    assert result.severity_level == "Minimal"
    assert result.risk_flag is False


def test_phq9_mild_score():
    responses = {str(i): 0 for i in range(1, 10)}
    responses["1"] = 2
    responses["2"] = 2
    responses["3"] = 1
    result = assessment_service.score_phq9(responses)
    assert result.total_score == 5
    assert result.severity_level == "Mild"
    assert result.risk_flag is False


def test_phq9_moderate_score():
    responses = {str(i): 1 for i in range(1, 10)}
    responses["1"] = 2
    responses["2"] = 2
    responses["3"] = 2
    result = assessment_service.score_phq9(responses)
    assert result.total_score == 12
    assert result.severity_level == "Moderate"


def test_phq9_moderately_severe():
    responses = {str(i): 2 for i in range(1, 10)}
    result = assessment_service.score_phq9(responses)
    assert result.total_score == 18
    assert result.severity_level == "Moderately Severe"


def test_phq9_severe_score():
    responses = {str(i): 3 for i in range(1, 10)}
    result = assessment_service.score_phq9(responses)
    assert result.total_score == 27
    assert result.severity_level == "Severe"
    assert result.risk_flag is True


def test_phq9_item9_triggers_risk_flag():
    responses = {str(i): 0 for i in range(1, 10)}
    responses["9"] = 1
    result = assessment_service.score_phq9(responses)
    assert result.risk_flag is True
    assert result.total_score == 1


def test_phq9_item9_risk_urgent_in_recommendations():
    responses = {str(i): 0 for i in range(1, 10)}
    responses["9"] = 1
    result = assessment_service.score_phq9(responses)
    assert result.risk_flag is True
    assert any("URGENT" in rec for rec in result.recommendations)


def test_phq9_returns_recommendations():
    responses = {str(i): 2 for i in range(1, 10)}
    result = assessment_service.score_phq9(responses)
    assert len(result.recommendations) > 0


def test_gad7_minimal_score():
    responses = {str(i): 0 for i in range(1, 8)}
    result = assessment_service.score_gad7(responses)
    assert result.total_score == 0
    assert result.severity_level == "Minimal"
    assert result.risk_flag is False


def test_gad7_mild_score():
    responses = {str(i): 1 for i in range(1, 8)}
    result = assessment_service.score_gad7(responses)
    assert result.total_score == 7
    assert result.severity_level == "Mild"


def test_gad7_moderate_score():
    responses = {str(i): 2 for i in range(1, 8)}
    result = assessment_service.score_gad7(responses)
    assert result.total_score == 14
    assert result.severity_level == "Moderate"


def test_gad7_severe_score():
    responses = {str(i): 3 for i in range(1, 8)}
    result = assessment_service.score_gad7(responses)
    assert result.total_score == 21
    assert result.severity_level == "Severe"
    assert result.risk_flag is True


def test_get_phq9_questions():
    questions = assessment_service.get_questions("PHQ9")
    assert len(questions) == 9
    assert "1" in questions
    assert "9" in questions


def test_get_gad7_questions():
    questions = assessment_service.get_questions("GAD7")
    assert len(questions) == 7
    assert "1" in questions
    assert "7" in questions


def test_unknown_assessment_type_returns_empty():
    questions = assessment_service.get_questions("UNKNOWN")
    assert questions == {}
