import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to authenticate user
async function authenticateUser(accessToken: string) {
  if (!accessToken) {
    return null;
  }

  try {
    const session = await kv.get(`session:${accessToken}`);
    if (!session) {
      return null;
    }

    // Check if session is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < currentTime) {
      // Clean up expired session
      await kv.del(`session:${accessToken}`);
      return null;
    }

    // Get full user data
    const userData = await kv.get(`user:${session.user.id}`);
    return userData || session.user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

app.get("/make-server-1f1a48b6/init", async (c) => {
  try {
    // Initialize demo data or perform any startup tasks
    console.log('Certificate validation service initialized');
    
    // Create demo user if it doesn't exist
    const demoUserId = await kv.get('user_email:demo@test.com');
    if (!demoUserId) {
      const userId = 'demo_user_12345';
      const userData = {
        id: userId,
        email: 'demo@test.com',
        name: 'Demo User',
        institution: 'Demo University',
        role: 'user',
        department: 'Computer Science',
        password: 'password123',
        created_at: new Date().toISOString()
      };
      
      await kv.set(`user:${userId}`, userData);
      await kv.set('user_email:demo@test.com', userId);
      console.log('Demo user created');
    }
    
    return c.json({ message: 'Service initialized successfully' });
  } catch (error) {
    console.error('Initialization error:', error);
    return c.json({ error: 'Initialization failed' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-1f1a48b6/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup endpoint
app.post("/make-server-1f1a48b6/signup", async (c) => {
  try {
    console.log('Signup request received');
    const body = await c.req.json();
    const { name, email, password, institution, role, department } = body;
    console.log('Signup attempt for email:', email, 'name:', name);

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`user_email:${email}`);
    if (existingUser) {
      console.log('User already exists for email:', email);
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Generate a simple user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated user ID:', userId);

    // Create user data
    const userData = {
      id: userId,
      email,
      name,
      institution: institution || '',
      role: role || 'user',
      department: department || '',
      password, // In production, this should be hashed
      created_at: new Date().toISOString()
    };

    // Store user data
    await kv.set(`user:${userId}`, userData);
    await kv.set(`user_email:${email}`, userId); // For email lookup
    console.log('User data stored successfully');

    // Create session token
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const session = {
      access_token: sessionToken,
      user: {
        id: userId,
        email,
        user_metadata: {
          name,
          role: role || 'user'
        }
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Store session
    await kv.set(`session:${sessionToken}`, session);
    console.log('Session created successfully');

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        name,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// User signin endpoint
app.post("/make-server-1f1a48b6/signin", async (c) => {
  try {
    console.log('Signin request received');
    const body = await c.req.json();
    const { email, password } = body;
    console.log('Signin attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get user by email
    const userId = await kv.get(`user_email:${email}`);
    console.log('User ID lookup result:', userId);
    if (!userId) {
      console.log('User not found for email:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Get user data
    const userData = await kv.get(`user:${userId}`);
    console.log('User data retrieved:', userData ? 'found' : 'not found');
    if (!userData || userData.password !== password) {
      console.log('Password mismatch or user data not found');
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Create session token
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const session = {
      access_token: sessionToken,
      user: {
        id: userId,
        email: userData.email,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Store session
    await kv.set(`session:${sessionToken}`, session);
    console.log('Session created successfully');

    return c.json({
      message: 'Signed in successfully',
      session,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Certificate upload endpoint
app.post("/make-server-1f1a48b6/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const user = await authenticateUser(accessToken);
    if (!user) {
      return c.json({ error: 'Invalid authorization token' }, 401);
    }

    const formData = await c.req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    const uploadResults = [];

    for (const file of files) {
      if (!file || !(file instanceof File)) continue;

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        uploadResults.push({
          fileName: file.name,
          error: 'File size exceeds 10MB limit'
        });
        continue;
      }

      try {
        // Generate unique file ID and simulate storage
        const timestamp = Date.now();
        const fileId = `file:${user.id}:${timestamp}`;
        
        // Store file metadata (simulating upload)
        await kv.set(fileId, {
          id: fileId,
          userId: user.id,
          fileName: file.name,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded'
        });

        uploadResults.push({
          fileName: file.name,
          fileId,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          success: true
        });

      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        uploadResults.push({
          fileName: file.name,
          error: 'Upload failed'
        });
      }
    }

    return c.json({
      message: 'Upload completed',
      results: uploadResults
    });

  } catch (error) {
    console.error('Upload endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Certificate validation endpoint
app.post("/make-server-1f1a48b6/validate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const user = await authenticateUser(accessToken);
    if (!user) {
      return c.json({ error: 'Invalid authorization token' }, 401);
    }

    const body = await c.req.json();
    const { fileIds } = body;

    if (!fileIds || !Array.isArray(fileIds)) {
      return c.json({ error: 'File IDs array required' }, 400);
    }

    const validationResults = [];

    for (const fileId of fileIds) {
      try {
        // Get file metadata
        const fileData = await kv.get(fileId);
        if (!fileData || fileData.userId !== user.id) {
          validationResults.push({
            fileId,
            error: 'File not found or access denied'
          });
          continue;
        }

        // Simulate AI validation (in real implementation, this would call actual AI services)
        const mockValidation = generateMockValidation(fileData);

        // Store validation result
        const validationId = `validation:${user.id}:${Date.now()}`;
        const validationResult = {
          id: validationId,
          fileId,
          userId: user.id,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          validatedAt: new Date().toISOString(),
          ...mockValidation
        };

        await kv.set(validationId, validationResult);

        // Update file status
        await kv.set(fileId, {
          ...fileData,
          status: 'validated',
          validationId,
          validatedAt: new Date().toISOString()
        });

        validationResults.push(validationResult);

      } catch (error) {
        console.error(`Validation error for ${fileId}:`, error);
        validationResults.push({
          fileId,
          error: 'Validation failed'
        });
      }
    }

    return c.json({
      message: 'Validation completed',
      results: validationResults
    });

  } catch (error) {
    console.error('Validation endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user validations
app.get("/make-server-1f1a48b6/validations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const user = await authenticateUser(accessToken);
    if (!user) {
      return c.json({ error: 'Invalid authorization token' }, 401);
    }

    // Get all validations for the user
    const validations = await kv.getByPrefix(`validation:${user.id}:`);
    
    // Sort by validation date (newest first)
    validations.sort((a, b) => new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime());

    return c.json({
      validations: validations.slice(0, 50) // Limit to last 50 validations
    });

  } catch (error) {
    console.error('Get validations error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mock validation function
function generateMockValidation(fileData: any) {
  const baseScore = Math.floor(Math.random() * 30) + 70; // 70-99
  const isAuthentic = baseScore >= 85;
  const hasSuspiciousElements = Math.random() < 0.3;
  
  const issues = [];
  if (hasSuspiciousElements) {
    const possibleIssues = [
      'Signature inconsistency detected',
      'Date format anomaly',
      'Unusual font variation',
      'Layout inconsistency',
      'Seal verification pending'
    ];
    const numIssues = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numIssues; i++) {
      const issue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
      if (!issues.includes(issue)) {
        issues.push(issue);
      }
    }
  }

  return {
    authenticity: isAuthentic ? 'authentic' : 'suspicious',
    confidenceScore: baseScore,
    issues,
    processingTime: Math.floor(Math.random() * 3000) + 1000,
    metadata: {
      institution: 'Sample University',
      studentName: 'John Doe',
      degree: 'Bachelor of Science',
      graduationDate: '2023-05-15',
      certificateId: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      issueDate: '2023-05-20',
      verificationHash: 'sha256:' + Math.random().toString(36).substr(2, 16)
    },
    technicalAnalysis: {
      ocrAccuracy: Math.floor(Math.random() * 10) + 90,
      layoutAnalysis: Math.floor(Math.random() * 15) + 85,
      signatureVerification: Math.floor(Math.random() * 20) + 80,
      institutionMatch: Math.floor(Math.random() * 12) + 88,
      blockchainVerification: Math.random() > 0.5 ? 'verified' : 'pending',
      aiDetection: Math.random() > 0.9 ? 'flagged' : 'clean'
    }
  };
}

Deno.serve(app.fetch);