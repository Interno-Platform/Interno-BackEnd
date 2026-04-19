# Test Examples for Internship Platform

## 1. Apply for Internship

```bash
curl -X POST http://localhost:5000/internships/apply \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "internshipId": 5,
    "coverLetter": "أنا مهتم جدًا بهذا التدريب لأني أريد تحسين مهاراتي في JavaScript"
  }'
```

**Success Response:**
```json
{
  "message": "Application submitted and accepted successfully",
  "internshipId": 5,
  "traineeId": 1,
  "status": "accepted"
}
```

---

## 2. Get Trainee Applications

```bash
curl -X GET http://localhost:5000/internships/trainee/1/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Applications retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 1,
      "internship_id": 5,
      "status": "accepted",
      "applied_at": "2026-04-08T10:00:00Z",
      "reviewed_at": "2026-04-08T10:00:00Z",
      "title": "Junior JavaScript Developer",
      "description": "...",
      "company_name": "Tech Company",
      "notes": null
    }
  ]
}
```

---

## 3. Review Application (Company)

```bash
curl -X PATCH http://localhost:5000/internships/applications/1/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer COMPANY_JWT_TOKEN" \
  -d '{
    "status": "accepted",
    "notes": "ممتاز! ننتظر انضمامك للفريق"
  }'
```

**Response:**
```json
{
  "message": "Application accepted successfully",
  "applicationId": 1,
  "status": "accepted"
}
```

---

## 4. Submit Quiz Answers

```bash
curl -X POST http://localhost:5000/trainees/quiz-submission/submit-quiz-answers \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "answers": [
      {
        "questionId": 1,
        "selectedOptionId": 3
      },
      {
        "questionId": 2,
        "selectedOptionId": 8
      },
      {
        "questionId": 3,
        "selectedOptionId": 12
      }
    ]
  }'
```

**Response:**
```json
{
  "message": "Quiz submitted successfully",
  "answersCount": 3,
  "scoresUpdated": [
    {
      "traineeId": 1,
      "skillId": 5,
      "totalQuestions": 3,
      "correctAnswers": 2,
      "scorePercentage": "66.67"
    }
  ]
}
```

---

## 5. Submit Exam Code Solution

```bash
curl -X POST http://localhost:5000/trainees/quiz-submission/submit-exam-solution \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "examId": 2,
    "codeSolution": "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}",
    "language": "JavaScript"
  }'
```

**Response:**
```json
{
  "message": "Exam solution submitted successfully",
  "examId": 2,
  "traineeId": 1,
  "language": "JavaScript"
}
```

---

## 6. Mark Quiz as Completed

```bash
curl -X POST http://localhost:5000/trainees/quiz-submission/mark-quiz-completed \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "examId": 2,
    "quizScore": 75,
    "internshipId": 5
  }'
```

**Response:**
```json
{
  "message": "Quiz marked as completed",
  "examId": 2,
  "traineeId": 1,
  "quizScore": 75,
  "quizCompleted": true
}
```

---

## 7. Get Trainee Scores

```bash
curl -X GET http://localhost:5000/trainees/quiz-submission/scores/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Scores retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "skill_id": 5,
      "skill_name": "JavaScript",
      "total_questions": 3,
      "correct_answers": 2,
      "score_percentage": "66.67",
      "last_assessed": "2026-04-08T11:30:00Z"
    }
  ]
}
```

---

## 8. Get Trainee Progress (Overall)

```bash
curl -X GET http://localhost:5000/trainees/quiz-submission/progress/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Trainee progress retrieved successfully",
  "data": {
    "traineeId": 1,
    "totalSkills": 3,
    "averageScore": "72.34",
    "lowestScore": "60.00",
    "highestScore": "85.00"
  }
}
```

---

## 9. Get Quiz Status

```bash
curl -X GET http://localhost:5000/trainees/quiz-submission/quiz-status/1/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Quiz status retrieved successfully",
  "data": {
    "id": 1,
    "exam_id": 2,
    "trainee_id": 1,
    "code_solution": "function fibonacci(n) { ... }",
    "language": "JavaScript",
    "quiz_completed": true,
    "quiz_score": 75,
    "quiz_submitted_at": "2026-04-08T11:45:00Z",
    "submitted_at": "2026-04-08T11:40:00Z",
    "internship_id": 5
  }
}
```

---

## Troubleshooting

### Error: "Quiz submission not found"
- تأكد من أن `traineeId` و `examId` صحيحان
- تأكد من أن المتدرب قد بدأ الامتحان من قبل

### Error: "Failed to submit quiz answers"
- تأكد من أن `questionId` و `selectedOptionId` موجودان في قاعدة البيانات
- تأكد من أن الصيغة صحيحة:
  ```json
  {
    "traineeId": 1,
    "answers": [
      { "questionId": 1, "selectedOptionId": 3 }
    ]
  }
  ```

### Error: "Exam not found"
- تأكد من أن `examId` صحيح وموجود في قاعدة البيانات

---

## Database Queries for Debugging

### الحصول على جميع تطبيقات المتدرب
```sql
SELECT * FROM internship_applications WHERE trainee_id = 1;
```

### الحصول على درجات المتدرب
```sql
SELECT * FROM trainees_scores WHERE trainee_id = 1;
```

### الحصول على إجابات المتدرب
```sql
SELECT ta.*, q.skill_id, opt.is_correct 
FROM trainees_answers ta
JOIN questions q ON ta.question_id = q.id
JOIN options opt ON ta.selected_option_id = opt.id
WHERE ta.trainee_id = 1;
```

### الحصول على حالة الامتحان
```sql
SELECT * FROM exam_submissions WHERE trainee_id = 1;
```
