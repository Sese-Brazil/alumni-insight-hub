const db = require('../config/db');

// Get alumni profile with program and college information
const getProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get from alumni_records with program and college joins
    const [records] = await db.query(
      `SELECT 
        ar.student_id,
        ar.first_name,
        ar.last_name,
        ar.middle_name,
        ar.suffix,
        ar.batch_year,
        ar.status,
        ar.survey_status,
        u.email,
        u.phone,
        u.address,
        p.id as program_id,
        p.name as program_name,
        p.code as program_code,
        c.id as college_id,
        c.name as college_name,
        c.code as college_code
       FROM alumni_records ar
       LEFT JOIN user u ON ar.student_id = u.username
       LEFT JOIN programs p ON ar.program_id = p.id
       LEFT JOIN colleges c ON p.college_id = c.id
       WHERE ar.student_id = ?`,
      [studentId]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update alumni profile (contact info only)
const updateProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { email, phone, address } = req.body;

    // Update user table
    await db.query(
      `UPDATE user SET email = ?, phone = ?, address = ? WHERE username = ?`,
      [email, phone, address, studentId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get employment history
const getEmploymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [records] = await db.query(
      `SELECT * FROM employment_records 
       WHERE student_id = ? 
       ORDER BY start_date DESC`,
      [studentId]
    );

    res.json(records);
  } catch (error) {
    console.error('Get employment error:', error);
    res.status(500).json({ error: 'Failed to fetch employment history' });
  }
};

// Add employment record
const addEmploymentRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, company, position, industry, start_date, monthly_income } = req.body;

    const [result] = await db.query(
      `INSERT INTO employment_records 
       (student_id, status, company, position, industry, start_date, monthly_income)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, status, company, position, industry, start_date, monthly_income]
    );

    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Employment record added successfully' 
    });
  } catch (error) {
    console.error('Add employment error:', error);
    res.status(500).json({ error: 'Failed to add employment record' });
  }
};

// Update employment record
const updateEmploymentRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, company, position, industry, start_date, monthly_income } = req.body;

    await db.query(
      `UPDATE employment_records 
       SET status = ?, company = ?, position = ?, industry = ?, 
           start_date = ?, monthly_income = ?
       WHERE id = ?`,
      [status, company, position, industry, start_date, monthly_income, id]
    );

    res.json({ success: true, message: 'Employment record updated successfully' });
  } catch (error) {
    console.error('Update employment error:', error);
    res.status(500).json({ error: 'Failed to update employment record' });
  }
};

// =============================
// GET COLLEGE SURVEY (for alumni)
// =============================
const getCollegeSurvey = async (req, res) => {
  try {
    const { collegeId } = req.params;
    console.log('Fetching survey for college:', collegeId); // Debug log

    // Get active published survey for this college
    const [published] = await db.query(
      `SELECT * FROM published_surveys 
       WHERE college_id = ? AND status = 'active'
       ORDER BY published_at DESC LIMIT 1`,
      [collegeId]
    );

    if (published.length === 0) {
      return res.status(404).json({ error: 'No active survey found for this college' });
    }

    const version = published[0].version;

    // Get categories
    const [categories] = await db.query(
      `SELECT * FROM survey_categories ORDER BY order_index ASC`
    );

    // Get questions for this version that apply to this college
    const result = [];
    for (const cat of categories) {
      const [questions] = await db.query(
        `SELECT * FROM survey_questions 
         WHERE category_id = ? AND version = ? 
         AND (colleges IS NULL OR colleges = '[]' OR JSON_CONTAINS(colleges, ?))
         ORDER BY order_index ASC`,
        [cat.id, version, JSON.stringify(String(collegeId))]
      );

      // Parse options JSON for each question
      const parsedQuestions = questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        colleges: q.colleges ? JSON.parse(q.colleges) : []
      }));

      result.push({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        order_index: cat.order_index,
        questions: parsedQuestions
      });
    }

    res.json({ 
      survey: result,
      version: version,
      published_at: published[0].published_at
    });

  } catch (error) {
    console.error('Get college survey error:', error);
    res.status(500).json({ error: 'Failed to fetch college survey' });
  }
};

// =============================
// SUBMIT SURVEY RESPONSE
// =============================
const submitSurveyResponse = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { studentId } = req.params;
    const { version, answers } = req.body;

    // Validate required fields
    if (!studentId || !version || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await connection.beginTransaction();

    // Create survey response record
    const [responseResult] = await connection.query(
      `INSERT INTO survey_responses 
       (student_id, survey_version, completed_at, status) 
       VALUES (?, ?, NOW(), 'completed')`,
      [studentId, version]
    );

    const responseId = responseResult.insertId;

    // Insert all answers
    for (const answer of answers) {
      await connection.query(
        `INSERT INTO survey_answers 
         (response_id, question_id, answer_text, answer_options, answer_number)
         VALUES (?, ?, ?, ?, ?)`,
        [
          responseId, 
          answer.question_id, 
          answer.answer_text || null,
          answer.answer_options ? JSON.stringify(answer.answer_options) : null,
          answer.answer_number || null
        ]
      );
    }

    // Update alumni survey status
    await connection.query(
      `UPDATE alumni_records 
       SET survey_status = 'completed' 
       WHERE student_id = ?`,
      [studentId]
    );

    await connection.commit();

    res.json({ 
      success: true, 
      message: 'Survey submitted successfully' 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Submit survey error:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  } finally {
    connection.release();
  }
};

// =============================
// GET SURVEY RESPONSES
// =============================
const getSurveyResponses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [responses] = await db.query(
      `SELECT 
        sr.*,
        sa.question_id,
        sa.answer_text,
        sa.answer_options,
        sa.answer_number,
        sq.text as question_text,
        sq.type as question_type
       FROM survey_responses sr
       LEFT JOIN survey_answers sa ON sr.id = sa.response_id
       LEFT JOIN survey_questions sq ON sa.question_id = sq.id
       WHERE sr.student_id = ?
       ORDER BY sr.completed_at DESC, sa.id ASC`,
      [studentId]
    );

    // Group answers by response
    const grouped = responses.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          student_id: row.student_id,
          survey_version: row.survey_version,
          completed_at: row.completed_at,
          status: row.status,
          answers: []
        };
      }
      if (row.question_id) {
        acc[row.id].answers.push({
          question_id: row.question_id,
          question_text: row.question_text,
          question_type: row.question_type,
          answer_text: row.answer_text,
          answer_options: row.answer_options ? JSON.parse(row.answer_options) : null,
          answer_number: row.answer_number
        });
      }
      return acc;
    }, {});

    res.json(Object.values(grouped));

  } catch (error) {
    console.error('Get survey responses error:', error);
    res.status(500).json({ error: 'Failed to fetch survey responses' });
  }
};

// =============================
// CHECK IF SURVEY IS COMPLETED
// =============================
const checkSurveyStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [records] = await db.query(
      `SELECT survey_status FROM alumni_records WHERE student_id = ?`,
      [studentId]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      completed: records[0].survey_status === 'completed',
      status: records[0].survey_status
    });

  } catch (error) {
    console.error('Check survey status error:', error);
    res.status(500).json({ error: 'Failed to check survey status' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getEmploymentHistory,
  addEmploymentRecord,
  updateEmploymentRecord,
  getCollegeSurvey,
  submitSurveyResponse,
  getSurveyResponses,
  checkSurveyStatus
};