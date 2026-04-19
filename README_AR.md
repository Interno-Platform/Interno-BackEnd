# منصة التدريب الداخلية - شرح الميزات الجديدة

## ✅ ما تم إنجازه

تم تطوير نظام متكامل لإدارة التدريبات والامتحانات والتقييمات. إليك ملخص الميزات الجديدة:

---

## 🎯 1. نظام طلبات التقديم على التدريبات
### التفاصيل:
- المتدربون يمكنهم التقديم على البرامج التدريبية
- كل طلب يحتوي على صورة تعريفية اختيارية (Cover Letter)
- الشركات يمكنهم مراجعة الطلبات وقبول أو رفض المتدربين
- تتبع الحالة (مرسل/قيد المراجعة/مقبول/مرفوض/مكتمل)

### ملف Migration:
```
database/Migrations_Files/0016_create_internship_applications_table.sql
```

### Service:
```
src/Services/internshipServices/internshipApplications.services.js
```

### Controller:
```
src/controllers/internshipControllers/internshipApplications.controller.js
```

### Routes:
```
src/routes/internshipRoutes/applications.js
```

---

## 📊 2. نظام الدرجات والتقييم
### التفاصيل:
- يتم حساب درجة المتدرب تلقائيًا بناءً على إجابات الأسئلة الصحيحة
- كل مهارة لها درجة منفصلة
- يتم تخزين:
  - عدد الأسئلة الإجمالي
  - عدد الإجابات الصحيحة
  - نسبة النجاح (%)
  - تاريخ آخر تقييم

### ملف Migration:
```
database/Migrations_Files/0017_create_trainees_scores_table.sql
```

### Service:
```
src/Services/traineesServices/traineesScores.services.js
```

---

## 🎓 3. نظام الاختبارات والامتحانات
### التفاصيل:
- المتدربون يمكنهم الإجابة على أسئلة المهارات
- المتدربون يمكنهم تقديم حل الامتحان البرمجي (Code Solution)
- تتبع حالة الاختبار:
  - هل تم الإجابة على الأسئلة
  - ما هي درجة الاختبار
  - متى تم التقديم

### تحديث Migration:
```
database/Migrations_Files/0018_update_exam_submissions_add_completion_status.sql
```

### Service:
```
src/Services/traineesServices/quizSubmission.services.js
```

### Controller:
```
src/controllers/traineesControllers/traineesQuizSubmission.controller.js
```

### Routes:
```
src/routes/traineesRoutes/quizSubmission.js
```

---

## 🚀 Flow الكامل للمتدرب

```
1️⃣  بدء البرنامج
   ↓
2️⃣  التقديم على التدريب
   ↓
3️⃣  قبول الطلب من الشركة
   ↓
4️⃣  الإجابة على أسئلة المهارات
   (يتم حساب الدرجات تلقائيًا)
   ↓
5️⃣  تقديم حل الامتحان البرمجي
   ↓
6️⃣  تحديد انتهاء الامتحان
   ↓
7️⃣  الاستعلام عن التقدم الكلي
```

---

## 📁 الملفات المُنشأة

### Database Migrations:
```
✅ 0016_create_internship_applications_table.sql
✅ 0017_create_trainees_scores_table.sql
✅ 0018_update_exam_submissions_add_completion_status.sql
```

### Services:
```
✅ src/Services/internshipServices/internshipApplications.services.js
✅ src/Services/traineesServices/traineesScores.services.js
✅ src/Services/traineesServices/quizSubmission.services.js
```

### Controllers:
```
✅ src/controllers/internshipControllers/internshipApplications.controller.js
✅ src/controllers/traineesControllers/traineesQuizSubmission.controller.js
```

### Routes:
```
✅ src/routes/internshipRoutes/applications.js
✅ src/routes/traineesRoutes/quizSubmission.js
```

### Documentation:
```
✅ INTERNSHIP_API_DOCS.md
✅ TEST_EXAMPLES.md
✅ README.md (هذا الملف)
```

---

## 🔧 التحسينات على Skill Service

تم تحسين خدمة المهارات بـ:
- إضافة logging مفصل لتتبع عملية توليد الأسئلة
- معالجة الأخطاء بشكل أفضل
- توليد الأسئلة تلقائيًا من Groq AI عند إضافة مهارة جديدة
- عدم تكرار الأسئلة (backfill اختياري)

---

## 🔑 المتطلبات

### في ملف `.env`:
```
API_KEY=your_groq_api_key_here
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306
PORT=5000
```

---

## 📊 Database Schema

### جدول internship_applications
```sql
- id (PK)
- internship_id (FK to internships)
- trainee_id (FK to trainees)
- status (applied/rejected/accepted/completed)
- cover_letter (TEXT, اختياري)
- applied_at (TIMESTAMP)
- reviewed_at (DATETIME)
- reviewed_by (FK to users)
- notes (TEXT)
- UNIQUE(internship_id, trainee_id)
```

### جدول trainees_scores
```sql
- id (PK)
- trainee_id (FK to trainees)
- skill_id (FK to skills)
- total_questions (عدد الأسئلة)
- correct_answers (عدد الإجابات الصحيحة)
- score_percentage (النسبة المئوية)
- last_assessed (آخر تقييم)
- UNIQUE(trainee_id, skill_id)
```

### تحديثات على جدول exam_submissions
```sql
- quiz_completed (BOOLEAN) ← جديد
- quiz_score (SMALLINT) ← جديد
- quiz_submitted_at (DATETIME) ← جديد
```

---

## 🧪 كيفية الاختبار

### 1. تشغيل Migrations:
```bash
npm run migrate
```

### 2. تقديم على تدريب:
```bash
curl -X POST http://localhost:5000/internships/apply \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "internshipId": 5,
    "coverLetter": "أنا مهتم بهذا التدريب"
  }'
```

### 3. الإجابة على الأسئلة:
```bash
curl -X POST http://localhost:5000/trainees/quiz-submission/submit-quiz-answers \
  -H "Content-Type: application/json" \
  -d '{
    "traineeId": 1,
    "answers": [
      { "questionId": 1, "selectedOptionId": 3 },
      { "questionId": 2, "selectedOptionId": 8 }
    ]
  }'
```

### 4. الحصول على التقدم:
```bash
curl -X GET http://localhost:5000/trainees/quiz-submission/progress/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 ملاحظات مهمة

### عن توليد الأسئلة:
- يتم توليد **3 أسئلة** افتراضيًا لكل مهارة
- كل سؤال يحتوي على **4 خيارات** (خيار واحد صحيح)
- يتم استخدام **Groq API** لتوليد الأسئلة تلقائيًا
- الأسئلة **لا تُكرر** - إذا كانت المهارة عندها أسئلة بالفعل، يتم تخطيها

### عن الدرجات:
- يتم حساب الدرجات **تلقائيًا** بعد كل submission
- الدرجة = (الإجابات الصحيحة / إجمالي الأسئلة) × 100
- يتم تحديث آخر وقت تقييم

### عن الامتحانات:
- المتدرب يمكنه تقديم الحل أكثر من مرة
- كل submission جديد يحدث الحل السابق
- يتم تتبع وقت التقديم الفعلي

---

## 🐛 Debugging

### لعرض السجلات (Logs):
جميع عمليات توليد الأسئلة توجد logs مفصلة في الـ console:
```
🎯 Adding skills for trainee X
📝 Skills provided: [...]
✅ Normalized skills
🔍 Existing skills found: X
➕ New skills to add: X
✅ Inserted X new skills
📊 Total skills to link: X
🤖 Processing questions generation
📝 Generating questions for skill: X
✅ Groq API Response received
🔍 Extracted questions: X
✅ Sanitized questions: X
💾 Inserting X questions
✅ Question X inserted
✓ X options inserted
✅ Successfully inserted all questions
```

### في حالة المشاكل:
تحقق من:
1. ✅ `API_KEY` موجودة في `.env`
2. ✅ اتصال قاعدة البيانات يعمل
3. ✅ Migrations تم تشغيلها بنجاح
4. ✅ إذا كان الـ API_KEY صحيح (تجربة مع Groq مباشرة)

---

## 📚 الوثائق الإضافية

- **INTERNSHIP_API_DOCS.md**: شرح مفصل لجميع الـ API endpoints
- **TEST_EXAMPLES.md**: أمثلة عملية للـ requests والـ responses

---

## ✨ الخلاصة

تم بناء نظام متكامل يوفر:
- ✅ إدارة طلبات التقديم
- ✅ حساب الدرجات تلقائيًا
- ✅ توليد الأسئلة من AI
- ✅ تتبع التقدم الكامل
- ✅ معالجة الامتحانات والحلول

كل شيء موثق ويمكن اختباره فورًا! 🚀
