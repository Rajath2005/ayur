import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { 
  registerSchema, 
  loginSchema, 
  insertConversationSchema,
  chatMessageSchema,
  type User 
} from "@shared/schema";
import { 
  getChatResponse, 
  analyzeSymptoms, 
  getHerbalRemedies,
  generateAppointmentContext 
} from "./gemini";

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // AUTH ROUTES
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
    const user = req.user as User;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // CONVERSATION ROUTES
  app.get("/api/conversations", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const conversations = await storage.getConversationsByUserId(user.id);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const user = req.user as User;
      if (conversation.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const data = insertConversationSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error: any) {
      console.error("Create conversation error:", error);
      res.status(400).json({ message: error.message || "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const user = req.user as User;
      if (conversation.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteConversation(req.params.id);
      res.json({ message: "Conversation deleted" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // MESSAGE ROUTES
  app.get("/api/messages/:conversationId", requireAuth, async (req: Request, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const user = req.user as User;
      if (conversation.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const messages = await storage.getMessagesByConversationId(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // CHAT ROUTE (with AI response)
  app.post("/api/chat", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const data = chatMessageSchema.parse(req.body);

      // Verify conversation belongs to user
      const conversation = await storage.getConversation(data.conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: data.conversationId,
        role: "user",
        content: data.content,
        attachments: data.attachments || null,
      });

      // Get conversation history for context
      const history = await storage.getMessagesByConversationId(data.conversationId);
      const conversationHistory = history.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await getChatResponse(data.content, conversationHistory);

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: data.conversationId,
        role: "assistant",
        content: aiResponse.content,
        attachments: null,
      });

      // Update conversation title if it's the first message
      if (history.length === 0) {
        const title = data.content.slice(0, 50) + (data.content.length > 50 ? "..." : "");
        await storage.updateConversation(data.conversationId, { title });
      }

      // Update conversation timestamp
      await storage.updateConversation(data.conversationId, { 
        updatedAt: new Date() 
      });

      res.json({ userMessage, aiMessage });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error.message || "Failed to send message" });
    }
  });

  // SYMPTOM ANALYSIS ROUTE
  app.post("/api/symptom", requireAuth, async (req: Request, res: Response) => {
    try {
      const { symptoms, conversationId } = req.body;
      
      if (!symptoms || typeof symptoms !== "string") {
        return res.status(400).json({ message: "Symptoms are required" });
      }

      const analysis = await analyzeSymptoms(symptoms);

      // If conversationId provided, save to that conversation
      if (conversationId) {
        const user = req.user as User;
        const conversation = await storage.getConversation(conversationId);
        
        if (conversation && conversation.userId === user.id) {
          await storage.createMessage({
            conversationId,
            role: "user",
            content: `Symptom analysis request: ${symptoms}`,
            attachments: null,
          });

          await storage.createMessage({
            conversationId,
            role: "assistant",
            content: analysis,
            attachments: null,
          });
        }
      }

      res.json({ analysis });
    } catch (error: any) {
      console.error("Symptom analysis error:", error);
      res.status(500).json({ message: error.message || "Failed to analyze symptoms" });
    }
  });

  // HERBAL REMEDIES ROUTE
  app.post("/api/remedies", requireAuth, async (req: Request, res: Response) => {
    try {
      const { condition, dosha } = req.body;
      
      if (!condition || typeof condition !== "string") {
        return res.status(400).json({ message: "Condition is required" });
      }

      const remedies = await getHerbalRemedies(condition, dosha);
      res.json({ remedies });
    } catch (error: any) {
      console.error("Herbal remedies error:", error);
      res.status(500).json({ message: error.message || "Failed to get remedies" });
    }
  });

  // APPOINTMENT LINK ROUTE
  app.post("/api/appointment-link", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const { reason, conversationId } = req.body;

      if (!reason || typeof reason !== "string") {
        return res.status(400).json({ message: "Reason is required" });
      }

      // Generate context for practitioner
      const context = await generateAppointmentContext(reason);

      // Create appointment record
      const appointment = await storage.createAppointment({
        userId: user.id,
        conversationId: conversationId || null,
        reason: context,
        appointmentLink: `https://calendly.com/ayurchat-practitioner?prefill=${encodeURIComponent(context)}`,
      });

      res.json({ 
        appointmentLink: appointment.appointmentLink,
        message: "Appointment link generated successfully" 
      });
    } catch (error: any) {
      console.error("Appointment link error:", error);
      res.status(500).json({ message: error.message || "Failed to generate appointment link" });
    }
  });

  // FILE UPLOAD ROUTE (placeholder - can be enhanced with actual file storage)
  app.post("/api/upload", requireAuth, async (req: Request, res: Response) => {
    try {
      // For now, this is a placeholder that returns mock file URLs
      // In production, integrate with Cloudinary or similar service
      const files = req.body.files || [];
      
      const uploadedFiles = files.map((file: any, index: number) => ({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        url: `/uploads/${file.name}`,
        uploadedAt: new Date(),
      }));

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
