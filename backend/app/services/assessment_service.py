from typing import Dict, List
from app.models.assessment import AssessmentResult

PHQ9_QUESTIONS = {
    "1": "Little interest or pleasure in doing things",
    "2": "Feeling down, depressed, or hopeless",
    "3": "Trouble falling or staying asleep, or sleeping too much",
    "4": "Feeling tired or having little energy",
    "5": "Poor appetite or overeating",
    "6": "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "7": "Trouble concentrating on things such as reading the newspaper or watching television",
    "8": "Moving or speaking so slowly that other people could have noticed or being so fidgety or restless",
    "9": "Thoughts that you would be better off dead or of hurting yourself in some way"
}

GAD7_QUESTIONS = {
    "1": "Feeling nervous, anxious, or on edge",
    "2": "Not being able to stop or control worrying",
    "3": "Worrying too much about different things",
    "4": "Trouble relaxing",
    "5": "Being so restless that it is hard to sit still",
    "6": "Becoming easily annoyed or irritable",
    "7": "Feeling afraid as if something awful might happen"
}


class AssessmentService:

    def score_phq9(self, responses: Dict[str, int], notes: str = None) -> AssessmentResult:
        total = sum(responses.values())
        item9_score = responses.get("9", 0)
        risk_flag = item9_score > 0

        if total <= 4:
            severity = "Minimal"
            interpretation = "Minimal or no depression symptoms detected. Monitor patient and repeat PHQ-9 as clinically indicated."
            recommendations = [
                "Monitor symptoms at the next scheduled visit",
                "Provide psychoeducation about depression and early warning signs",
                "Encourage healthy lifestyle habits including exercise and sleep hygiene"
            ]
        elif total <= 9:
            severity = "Mild"
            interpretation = "Mild depression symptoms present. Watchful waiting and supportive care are appropriate at this time."
            recommendations = [
                "Repeat PHQ-9 in 2 to 4 weeks to monitor trajectory",
                "Consider counseling or therapy referral",
                "Discuss lifestyle modifications including regular exercise, sleep hygiene, and social support",
                "Provide psychoeducation about depression and its treatment"
            ]
        elif total <= 14:
            severity = "Moderate"
            interpretation = "Moderate depression symptoms present. An active treatment plan is strongly recommended."
            recommendations = [
                "Create a formal written treatment plan with the patient",
                "Refer to CBT therapist for cognitive behavioral therapy",
                "Consider pharmacotherapy consultation with prescribing physician",
                "Repeat PHQ-9 in 2 weeks to assess treatment response",
                "Assess level of functional impairment at work and home"
            ]
        elif total <= 19:
            severity = "Moderately Severe"
            interpretation = "Moderately severe depression symptoms present. Active treatment with therapy and medication is strongly recommended."
            recommendations = [
                "Initiate pharmacotherapy and or psychotherapy immediately",
                "Urgent mental health specialist referral recommended",
                "Repeat PHQ-9 in 1 week to monitor closely",
                "Conduct detailed suicide risk assessment",
                "Consider intensive outpatient program if available"
            ]
        else:
            severity = "Severe"
            interpretation = "Severe depression symptoms present. Immediate clinical intervention is required. Consider hospitalization if safety is a concern."
            recommendations = [
                "Immediate pharmacotherapy initiation required",
                "Expedited mental health specialist referral today",
                "Daily monitoring and check-in calls recommended",
                "Assess need for inpatient hospitalization",
                "Comprehensive suicide risk assessment using C-SSRS required",
                "Activate safety plan immediately"
            ]

        if risk_flag:
            recommendations.insert(0, "URGENT: Item 9 is positive - conduct full suicide risk assessment using C-SSRS immediately and do not leave patient alone")

        return AssessmentResult(
            assessment_type="PHQ-9",
            total_score=total,
            severity_level=severity,
            risk_flag=risk_flag,
            interpretation=interpretation,
            recommendations=recommendations
        )

    def score_gad7(self, responses: Dict[str, int], notes: str = None) -> AssessmentResult:
        total = sum(responses.values())
        risk_flag = total >= 15

        if total <= 4:
            severity = "Minimal"
            interpretation = "Minimal anxiety symptoms. No clinical action required unless patient reports significant distress."
            recommendations = [
                "Monitor anxiety symptoms at the next visit",
                "Provide psychoeducation about anxiety and stress management"
            ]
        elif total <= 9:
            severity = "Mild"
            interpretation = "Mild anxiety symptoms present. Psychoeducation and lifestyle modifications are appropriate."
            recommendations = [
                "Provide psychoeducation about anxiety and its management",
                "Teach relaxation techniques including box breathing and progressive muscle relaxation",
                "Recommend regular aerobic exercise for anxiety reduction",
                "Sleep hygiene counseling and education",
                "Repeat GAD-7 in 4 weeks to monitor progress"
            ]
        elif total <= 14:
            severity = "Moderate"
            interpretation = "Moderate anxiety symptoms present. Therapy referral and possible medication evaluation are recommended."
            recommendations = [
                "Refer for CBT specifically targeting anxiety",
                "Consider SSRI or SNRI consultation with prescribing physician",
                "Structured problem-solving therapy as adjunct",
                "Repeat GAD-7 in 2 weeks to assess treatment response"
            ]
        else:
            severity = "Severe"
            interpretation = "Severe anxiety symptoms present. Immediate active treatment and specialist referral are indicated."
            recommendations = [
                "Immediate mental health specialist referral required",
                "Pharmacotherapy evaluation with prescribing physician",
                "Crisis assessment if panic attacks are present and severe",
                "Weekly monitoring appointments recommended",
                "Consider intensive outpatient program"
            ]

        return AssessmentResult(
            assessment_type="GAD-7",
            total_score=total,
            severity_level=severity,
            risk_flag=risk_flag,
            interpretation=interpretation,
            recommendations=recommendations
        )

    def get_questions(self, assessment_type: str) -> Dict[str, str]:
        if assessment_type.upper() == "PHQ9":
            return PHQ9_QUESTIONS
        elif assessment_type.upper() == "GAD7":
            return GAD7_QUESTIONS
        return {}


assessment_service = AssessmentService()
