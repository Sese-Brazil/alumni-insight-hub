const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../config/email');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Clean up expired OTPs every hour
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60 * 60 * 1000);

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query(
      'SELECT * FROM user WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    await db.query(
      'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        middleName: user.middle_name,
        suffix: user.suffix,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkStudentRecord = async (req, res) => {
  try {
    const { studentId, fullName } = req.body;

    // Validate inputs
    if (!studentId || !fullName) {
      return res.status(400).json({ 
        error: 'Student ID and Full Name are required' 
      });
    }

    // First, check if user already has an account
    const [existingUser] = await db.query(
      'SELECT * FROM user WHERE username = ?',
      [studentId]
    );

    if (existingUser.length > 0) {
      return res.json({ 
        status: 'already',
        message: 'This student ID already has an account. Please login instead.'
      });
    }

    // Check if student exists in alumni_records
    const [records] = await db.query(
      `SELECT 
        student_id, 
        first_name, 
        last_name, 
        middle_name, 
        suffix,
        CONCAT(first_name, ' ', last_name) as full_name
       FROM alumni_records 
       WHERE student_id = ?`,
      [studentId]
    );

    // If student ID not found in alumni_records
    if (records.length === 0) {
      return res.json({ 
        status: 'not_found',
        message: 'No alumni record found with this Student ID.'
      });
    }

    const alumni = records[0];

    const normalizeString = (str) => {
      if (!str) return '';
      return str.toString()
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const dbFullName = normalizeString(`${alumni.first_name} ${alumni.last_name}`);
    const dbFullNameWithMiddle = alumni.middle_name 
      ? normalizeString(`${alumni.first_name} ${alumni.middle_name} ${alumni.last_name}`)
      : null;
    const dbLastNameFirst = normalizeString(`${alumni.last_name}, ${alumni.first_name}`);
    const dbWithSuffix = alumni.suffix 
      ? normalizeString(`${alumni.first_name} ${alumni.last_name} ${alumni.suffix}`)
      : null;

    const inputNormalized = normalizeString(fullName);

    const validNames = [dbFullName];
    if (dbFullNameWithMiddle) validNames.push(dbFullNameWithMiddle);
    if (dbLastNameFirst) validNames.push(dbLastNameFirst);
    if (dbWithSuffix) validNames.push(dbWithSuffix);

    if (alumni.middle_name) {
      validNames.push(normalizeString(`${alumni.first_name} ${alumni.last_name}`));
    }

    console.log('Name comparison:', {
      input: inputNormalized,
      validNames: validNames,
      matches: validNames.includes(inputNormalized)
    });

    const nameMatches = validNames.includes(inputNormalized);

    if (!nameMatches) {
      return res.json({ 
        status: 'not_found',
        message: 'The name provided does not match our records. Please check and try again.'
      });
    }

    res.json({ 
      status: 'found',
      message: 'Alumni record verified successfully.',
      record: {
        studentId: alumni.student_id,
        firstName: alumni.first_name,
        lastName: alumni.last_name,
        middleName: alumni.middle_name,
        suffix: alumni.suffix,
        fullName: `${alumni.first_name} ${alumni.last_name}`
      }
    });

  } catch (error) {
    console.error('Check student error:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
};

const register = async (req, res) => {
  try {
    const { studentId, fullName, email, password } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM user WHERE username = ? OR email = ?',
      [studentId, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const [alumniRecords] = await db.query(
      `SELECT first_name, last_name, middle_name, suffix 
       FROM alumni_records 
       WHERE student_id = ?`,
      [studentId]
    );

    let firstName, lastName, middleName, suffix;

    if (alumniRecords.length > 0) {
      const alumni = alumniRecords[0];
      firstName = alumni.first_name;
      lastName = alumni.last_name;
      middleName = alumni.middle_name;
      suffix = alumni.suffix;
    } else {
      const nameParts = fullName.trim().split(/\s+/);
      firstName = nameParts[0];
      lastName = nameParts[nameParts.length - 1];
      middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;
      suffix = null;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await db.query('START TRANSACTION');

    try {
      await db.query(
        `INSERT INTO user 
         (username, email, password_hash, role, first_name, last_name, middle_name, suffix) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, email, passwordHash, 'alumni', firstName, lastName, middleName, suffix]
      );

      await db.query(
        `UPDATE alumni_records SET status = 'active' WHERE student_id = ?`,
        [studentId]
      );

      await db.query('COMMIT');

      res.status(201).json({ 
        success: true, 
        message: 'Account created successfully' 
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOTP();
    
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP. Please try again.' 
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({ error: 'OTP and email are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ 
        error: 'OTP expired or not found. Please request a new one.' 
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        error: 'OTP expired. Please request a new one.' 
      });
    }

    const enteredOtp = Array.isArray(otp) ? otp.join('') : otp;
    
    if (storedData.otp !== enteredOtp) {
      return res.status(400).json({ 
        error: 'Invalid OTP. Please try again.' 
      });
    }

    otpStore.delete(email);

    res.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

module.exports = {
  login,
  checkStudentRecord,
  register,
  sendOTP,
  verifyOTP
};