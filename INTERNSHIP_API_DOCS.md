# Internship Platform - API Documentation

## ملخص الميزات الجديدة

### 1. Internship Applications (تقديم على التدريبات)
المتدربون يمكنهم التقديم على التدريبات مع صورة تعريفية (cover letter)، والطلب يتم قبوله تلقائيًا فور التقديم.

#### Endpoints:

**تقديم على تدريب:**
```
POST /internships/apply
Body: {
  "traineeId": 1,
  "internshipId": 5,
  "coverLetter": "نص التعريف الشخصي (اختياري)"
}
```

**الحصول على طلبات المتدرب:**
```
GET /trainees/quiz-submission/trainee/:traineeId/applications
```

**الحصول على طلبات التدريب (للشركة):**
```
GET /internships/:internshipId/applications
```

**مراجعة الطلب (قبول/رفض):**
```
PATCH /internships/applications/:applicationId/review
Body: {
  "status": "accepted",  // أو "rejected"
  "notes": "ملاحظات الشركة (اختياري)"
}
```

---

## 2. Quiz Submission (الإجابة على الأسئلة)

### Flow:
1. المتدرب يجيب على جميع الأسئلة المرتبطة بمهارة معينة
2. يتم حفظ الإجابات في جدول `trainees_answers`
3. يتم حساب الدرجة تلقائيًا في جدول `trainees_scores`
4. يتم تحديث حالة التقدم الكلي للمتدرب

#### Endpoints:

**إرسال الإجابات:**
```
POST /trainees/quiz-submission/submit-quiz-answers
Body: {
  "traineeId": 1,
  "answers": [
    { "questionId": 1, "selectedOptionId": 3 },
    { "questionId": 2, "selectedOptionId": 8 },
    { "questionId": 3, "selectedOptionId": 12 }
  ]
}
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

**الحصول على حالة الامتحان:**
```
GET /trainees/quiz-submission/quiz-status/:traineeId/:examId
```

**تحديد أن الاختبار مكتمل:**
```
POST /trainees/quiz-submission/mark-quiz-completed
Body: {
  "traineeId": 1,
  "examId": 2,
  "quizScore": 75,
  "internshipId": 5  // اختياري - لتحديث حالة التطبيق
}
```

---

## 3. Exam Code Solution Submission (حل الامتحان البرمجي)

### Flow:
1. المتدرب يرسل حل الكود الخاص به
2. يتم حفظ الحل في جدول `exam_submissions`
3. يمكن للمراجع تقييم الحل لاحقًا

#### Endpoints:

**إرسال حل الامتحان:**
```
POST /trainees/quiz-submission/submit-exam-solution
Body: {
  "traineeId": 1,
  "examId": 2,
  "codeSolution": "function solution() { ... }",
  "language": "JavaScript"  // أو Python, Java, etc.
}
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

## 4. Trainee Scores & Progress (الدرجات والتقدم)

### الدرجات يتم حسابها تلقائيًا:
- من عدد الإجابات الصحيحة على الأسئلة
- يتم تخزينها في جدول `trainees_scores`

#### Endpoints:

**الحصول على جميع الدرجات:**
```
GET /trainees/quiz-submission/scores/:traineeId
```

**Response:**
```json
{
  "message": "Scores retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 1,
      "skill_id": 5,
      "skill_name": "JavaScript",
      "total_questions": 10,
      "correct_answers": 8,
      "score_percentage": "80.00",
      "last_assessed": "2026-04-08T10:30:00Z"
    }
  ]
}
```

**الحصول على درجة مهارة محددة:**
```
GET /trainees/quiz-submission/scores/:traineeId/:skillId
```

**الحصول على تقدم المتدرب الكلي:**
```
GET /trainees/quiz-submission/progress/:traineeId
```

**Response:**
```json
{
  "message": "Trainee progress retrieved successfully",
  "data": {
    "traineeId": 1,
    "totalSkills": 3,
    "averageScore": "75.00",
    "lowestScore": "60.00",
    "highestScore": "90.00"
  }
}
```

---

## Database Schema

### جدول internship_applications
```sql
- id (PK)
- internship_id (FK)
- trainee_id (FK)
- status (applied/rejected/accepted/completed)
- cover_letter
- applied_at
- reviewed_at
- reviewed_by (FK to users)
- notes
```

### جدول trainees_scores
```sql
- id (PK)
- trainee_id (FK)
- skill_id (FK)
- total_questions
- correct_answers
- score_percentage
- last_assessed
```

### جدول exam_submissions (تحديثات)
```sql
- code_solution (موجود بالفعل)
- quiz_completed (جديد)
- quiz_score (جديد)
- quiz_submitted_at (جديد)
```

---

## Migration Files

تم إنشاء 3 migration files جديدة:

1. **0016_create_internship_applications_table.sql**: جدول طلبات التقديم
2. **0017_create_trainees_scores_table.sql**: جدول الدرجات
3. **0018_update_exam_submissions_add_completion_status.sql**: تحديث جدول الامتحانات

---

## الـ Flow الكامل للمتدرب

```
1. المتدرب يقدم على تدريب
   ↓
2. يتم قبول الطلب تلقائيًا مباشرة
   ↓
3. المتدرب يجيب على أسئلة المهارات
   (يتم حساب الدرجات تلقائيًا في trainees_scores)
   ↓
4. المتدرب يحل الامتحان البرمجي
   (يتم حفظ الحل في exam_submissions)
   ↓
5. المتدرب يحدد أن الاختبار مكتمل
   (يتم تحديث حالة التطبيق إلى "completed")
   ↓
6. يمكن الاستعلام عن التقدم الكلي للمتدرب
```
