import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import {
  insertConversationSchema,
  type User
} from "@shared/schema";
import {
  getChatResponse
} from "./gemini";
import { analyzeSymptoms, getHerbalRemedies, generateAppointmentContext } from "./ai-utils";
import { verifyFirebaseToken, type AuthRequest } from "./middleware/verifyFirebaseToken";
import { storage } from "./storage";

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH ROUTES
  app.get("/api/auth/me", verifyFirebaseToken, (req: AuthRequest, res: Response) => {
    const decoded = req.user!;
    res.json({
      id: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || decoded.email || null,
      avatar: decoded.picture || null,
      provider: decoded.firebase?.sign_in_provider || null,
    });
  });

  // USER PROFILE ROUTES
  app.get("/api/users/me/profile", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const profile = await storage.getUserProfile?.(userId);

      if (!profile) {
        // Return default profile from Firebase Auth
        return res.json({
          id: userId,
          userId,
          email: req.user!.email || "",
          name: req.user!.name || req.user!.email || "",
          avatar: req.user!.picture || null,
          bio: null,
          phone: null,
        });
      }

      res.json(profile);
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: error.message || "Failed to get profile" });
    }
  });

  app.put("/api/users/me/profile", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { name, bio, phone, avatar } = req.body;

      // Check if storage method is available
      if (!storage.updateUserProfile) {
        console.error("[Profile Update] updateUserProfile method not available in storage");
        return res.status(501).json({
          message: "Profile updates not supported. MongoDB may not be configured."
        });
      }

      const profileData = {
        userId,
        email: req.user!.email || "",
        name,
        bio,
        phone,
        avatar,
      };

      console.log('[Profile Update] Updating profile for user:', userId, profileData);
      const updatedProfile = await storage.updateUserProfile(userId, profileData);
      console.log('[Profile Update] Success:', updatedProfile);
      res.json(updatedProfile);
    } catch (error: any) {
      console.error("Update profile error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  app.post("/api/users/me/avatar", upload.single('avatar'), verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;

      if (!req.file) {
        return res.status(400).json({ message: "No avatar file provided" });
      }

      if (!storage.updateUserProfile) {
        return res.status(501).json({ message: "Avatar upload not supported" });
      }

      // Convert to base64 data URL for MongoDB storage
      const base64 = req.file.buffer.toString('base64');
      const avatarUrl = `data:${req.file.mimetype};base64,${base64}`;

      // Update profile with new avatar
      const profile = await storage.updateUserProfile(userId, {
        userId,
        email: req.user!.email || "",
        avatar: avatarUrl
      });

      res.json({ avatar: avatarUrl, profile });
    } catch (error: any) {
      console.error("Upload avatar error:", error);
      res.status(500).json({ message: error.message || "Failed to upload avatar" });
    }
  });

  // USER SETTINGS ROUTES
  app.get("/api/users/me/settings", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const settings = await storage.getUserSettings?.(userId);

      if (!settings) {
        // Return default settings
        return res.json({
          userId,
          theme: 'light',
          emailNotifications: true,
          pushNotifications: false,
          profileVisibility: 'public',
        });
      }

      res.json(settings);
    } catch (error: any) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: error.message || "Failed to get settings" });
    }
  });

  app.put("/api/users/me/settings", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { theme, emailNotifications, pushNotifications, profileVisibility } = req.body;

      // Check if storage method is available
      if (!storage.updateUserSettings) {
        console.error("[Settings Update] updateUserSettings method not available in storage");
        return res.status(501).json({
          message: "Settings updates not supported. MongoDB may not be configured."
        });
      }

      const settingsData = {
        userId,
        theme,
        emailNotifications,
        pushNotifications,
        profileVisibility,
      };

      console.log('[Settings Update] Updating settings for user:', userId, settingsData);
      const updatedSettings = await storage.updateUserSettings(userId, settingsData);
      console.log('[Settings Update] Success:', updatedSettings);
      res.json(updatedSettings);
    } catch (error: any) {
      console.error("Update settings error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to update settings" });
    }
  });


  // CONVERSATION ROUTES
  app.get("/api/conversations", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      console.log(`🔵 [POST /api/conversations] Request received from user: ${userId}`, req.body);

      if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      let newCredits: number;
      try {
        // Strict credit check: Fail if deduction fails
        newCredits = await storage.deductCredits!(userId, 2, "NEW_CHAT");
        console.log(`💰 [POST /api/conversations] Credits deducted. Remaining: ${newCredits}`);
      } catch (error: any) {
        console.error("❌ [POST /api/conversations] Credit deduction failed:", error);
        if (error.message === "Insufficient credits") {
          const currentCredits = await storage.getUserCredits!(userId);
          return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
        }
        // Fail hard if credits can't be processed
        return res.status(500).json({ message: "Failed to process credits. Conversation not created." });
      }

      const data = {
        userId,
        title: req.body.title,
      };

      const conversation = await storage.createConversation(data);
      console.log("✅ [POST /api/conversations] DB Insert Success:", conversation);

      // Enforce strict response format
      const response = {
        success: true,
        conversation: {
          id: conversation.id, // Ensure this is mapped correctly in storage
          title: conversation.title,
          userId: conversation.userId,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        },
        credits: newCredits
      };

      console.log("📤 [POST /api/conversations] Sending response:", JSON.stringify(response));
      res.json(response);

    } catch (error: any) {
      console.error("❌ [POST /api/conversations] Critical Error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const userId = req.user!.uid;
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.put("/api/conversations/:id", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const userId = req.user!.uid;
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { title } = req.body;
      if (!title || typeof title !== "string") {
        return res.status(400).json({ message: "Title is required" });
      }

      const updatedConversation = await storage.updateConversation(req.params.id, { title });
      res.json(updatedConversation);
    } catch (error) {
      console.error("Update conversation error:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.delete("/api/conversations/:id", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const userId = req.user!.uid;
      if (conversation.userId !== userId) {
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
  app.get("/api/conversations/:conversationId/messages", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const userId = req.user!.uid;
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const messages = await storage.getMessagesByConversationId(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // CHAT ROUTE (with streaming AI response)
  app.post("/api/chat", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { conversationId, content, userMessageId, assistantMessageId } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ message: "conversationId and content are required" });
      }

      let conversation = await storage.getConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      } else if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check credits before proceeding - but don't deduct yet
      const currentCredits = await storage.getUserCredits!(userId);
      if (currentCredits < 1) {
        return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
      }

      // 1. Save user message with messageId for idempotency
      const userMessage = await storage.createMessage({
        id: userMessageId,
        conversationId,
        role: "user",
        content,
        attachments: null,
      });

      // 2. Get conversation history for AI context
      const history = await storage.getMessagesByConversationId(conversationId);
      const conversationHistory = history.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // 3. Get AI response
      const aiResponse = await getChatResponse(content, conversationHistory);

      // Deduct credits only after successful AI response
      // Use atomic deduction here
      let newCredits;
      try {
        newCredits = await storage.deductCredits!(userId, 1, "BOT_RESPONSE");
      } catch (error: any) {
        if (error.message === "Insufficient credits") {
          // This is a race condition edge case where credits were used up during generation
          return res.status(403).json({ error: "NO_CREDITS", credits: 0 });
        }
        throw error;
      }

      // 4. Save AI message with messageId for idempotency
      const assistantMessage = await storage.createMessage({
        id: assistantMessageId,
        conversationId,
        role: "assistant",
        content: aiResponse.content,
        attachments: null,
      });

      // 5. Update conversation title if it's the first message and title is "New Conversation"
      if (history.length <= 1 && conversation.title === "New Conversation") {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        await storage.updateConversation(conversationId, { title, updatedAt: new Date() });
      } else {
        await storage.updateConversation(conversationId, { updatedAt: new Date() });
      }

      res.json({ userMessage, assistantMessage, credits: newCredits });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error.message || "Failed to send message" });
    }
  });

  // SYMPTOM ANALYSIS ROUTE
  app.post("/api/symptom", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const { symptoms, conversationId } = req.body;

      if (!symptoms || typeof symptoms !== "string") {
        return res.status(400).json({ message: "Symptoms are required" });
      }

      const analysis = await analyzeSymptoms(symptoms);

      // If conversationId provided, save to that conversation
      if (conversationId) {
        const userId = req.user!.uid;
        const conversation = await storage.getConversation(conversationId);

        if (conversation && conversation.userId === userId) {
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
  app.post("/api/remedies", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
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

  app.put("/api/users/me/profile", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { name, bio, phone, avatar } = req.body;

      // Check if storage method is available
      if (!storage.updateUserProfile) {
        console.error("[Profile Update] updateUserProfile method not available in storage");
        return res.status(501).json({
          message: "Profile updates not supported. MongoDB may not be configured."
        });
      }

      const profileData = {
        userId,
        email: req.user!.email || "",
        name,
        bio,
        phone,
        avatar,
      };

      console.log('[Profile Update] Updating profile for user:', userId, profileData);
      const updatedProfile = await storage.updateUserProfile(userId, profileData);
      console.log('[Profile Update] Success:', updatedProfile);
      res.json(updatedProfile);
    } catch (error: any) {
      console.error("Update profile error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // APPOINTMENT LINK ROUTE
  app.post("/api/appointment-link", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { reason, conversationId } = req.body;

      if (!reason || typeof reason !== "string") {
        return res.status(400).json({ message: "Reason is required" });
      }

      // Generate context for practitioner
      const context = await generateAppointmentContext(reason);

      // Create appointment record
      const appointment = await storage.createAppointment({
        userId,
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

  // IMAGE CHAT SESSION ROUTES
  app.post("/api/image-chat-sessions", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Check and deduct 2 credits for creating image chat session
      try {
        const newCredits = await storage.deductCredits!(userId, 2, "NEW_CHAT");

        const data = {
          userId,
          title: req.body.title,
        };
        const session = await storage.createConversation(data);
        res.json({ ...session, credits: newCredits });
      } catch (error: any) {
        if (error.message === "Insufficient credits") {
          const currentCredits = await storage.getUserCredits!(userId);
          return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Create image chat session error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to create image chat session" });
    }
  });

  app.get("/api/image-chat-sessions/:id", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const session = await storage.getConversation(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Image chat session not found" });
      }

      const userId = req.user!.uid;
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get image chat session error:", error);
      res.status(500).json({ message: "Failed to fetch image chat session" });
    }
  });

  app.get("/api/image-chat-sessions/:conversationId/messages", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversation = await storage.getConversation(req.params.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Image chat session not found" });
      }

      const userId = req.user!.uid;
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const messages = await storage.getMessagesByConversationId(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get image chat messages error:", error);
      res.status(500).json({ message: "Failed to fetch image chat messages" });
    }
  });

  // IMAGE CHAT ROUTE (with image analysis)
  app.post("/api/image-chat", upload.single('image'), verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { conversationId, content, userMessageId, assistantMessageId } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ message: "conversationId and content are required" });
      }

      let conversation = await storage.getConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: "Image chat session not found" });
      } else if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check credits before proceeding
      const currentCredits = await storage.getUserCredits!(userId);
      if (currentCredits < 1) {
        return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
      }

      // Handle image upload if present
      let imageUrl = null;
      if (req.file) {
        const imageFile = req.file;
        // In a real implementation, you'd upload to cloud storage
        // For now, we'll create a data URL
        const base64 = imageFile.buffer.toString('base64');
        imageUrl = `data:${imageFile.mimetype};base64,${base64}`;
      }

      // 1. Save user message with messageId for idempotency
      const userMessage = await storage.createMessage({
        id: userMessageId,
        conversationId,
        role: "user",
        content,
        attachments: imageUrl ? [{ type: 'image', url: imageUrl }] : null,
      });

      // 2. Get conversation history for AI context
      const history = await storage.getMessagesByConversationId(conversationId);
      const conversationHistory = history.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // 3. Get AI response with image analysis if image is present
      let aiResponse;
      if (imageUrl) {
        // For image analysis, we'd integrate with HuggingFace or similar
        // For now, provide a placeholder response
        aiResponse = {
          content: `I've analyzed the image you uploaded. Based on Ayurvedic principles, I can see elements that suggest [analysis would go here]. ${content ? `Regarding your question "${content}", here's my analysis:` : ''} This appears to be a wellness-related image that could benefit from Ayurvedic perspective. Please note that this is AI-generated analysis and should not replace professional medical advice.`
        };
      } else {
        aiResponse = await getChatResponse(content, conversationHistory);
      }

      // Deduct credits only after successful AI response
      // Deduct 5 for image generation/analysis, 1 for text
      const deductionAmount = imageUrl ? 5 : 1;
      const deductionType = imageUrl ? "IMAGE_GENERATION" : "BOT_RESPONSE";

      let newCredits;
      try {
        newCredits = await storage.deductCredits!(userId, deductionAmount, deductionType);
      } catch (error: any) {
        if (error.message === "Insufficient credits") {
          return res.status(403).json({ error: "NO_CREDITS", credits: 0 });
        }
        throw error;
      }

      // 4. Save AI message with messageId for idempotency
      const assistantMessage = await storage.createMessage({
        id: assistantMessageId,
        conversationId,
        role: "assistant",
        content: aiResponse.content,
        attachments: null,
      });

      // 5. Update conversation title if it's the first message and title is "Image Analysis Session"
      if (history.length <= 1 && conversation.title === "Image Analysis Session") {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        await storage.updateConversation(conversationId, { title, updatedAt: new Date() });
      } else {
        await storage.updateConversation(conversationId, { updatedAt: new Date() });
      }

      res.json({ userMessage, assistantMessage, credits: newCredits });
    } catch (error: any) {
      console.error("Image chat error:", error);
      res.status(500).json({ message: error.message || "Failed to send image message" });
    }
  });

  // GET USER CREDITS
  app.get("/api/users/me/credits", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const credits = await storage.getUserCredits!(userId);
      const user = await storage.getUserCreditsDetails!(userId);
      res.json({
        success: true,
        remainingCredits: credits,
        maxCredits: user?.totalCredits || 40,
        usedCredits: (user?.totalCredits || 40) - credits,
        cycleStart: user?.cycleStart,
        cycleEnd: user?.cycleEnd,
        plan: 'free'
      });
    } catch (error: any) {
      console.error("Get credits error:", error);
      res.status(500).json({ message: error.message || "Failed to get credits" });
    }
  });

  // GET USER CREDITS DETAILS (WITH HISTORY)
  app.get("/api/users/me/credits/details", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      console.log('[Credits Details] Fetching for user:', userId);

      const credits = await storage.getUserCredits!(userId);
      console.log('[Credits Details] Credits:', credits);

      const user = await storage.getUserCreditsDetails!(userId);
      console.log('[Credits Details] User details:', user);

      const history = await storage.getCreditLogs!(userId, 5);
      console.log('[Credits Details] History count:', history?.length || 0);

      const response = {
        success: true,
        remainingCredits: credits,
        maxCredits: user?.totalCredits || 40,
        usedCredits: (user?.totalCredits || 40) - credits,
        cycleStart: user?.cycleStart,
        cycleEnd: user?.cycleEnd,
        resetInDays: user?.cycleEnd ? Math.ceil((new Date(user.cycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 15,
        usageHistory: history || [],
        plan: 'free'
      };

      console.log('[Credits Details] Sending response:', JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error: any) {
      console.error("Get credits details error:", error);
      res.status(500).json({ message: error.message || "Failed to get credits details" });
    }
  });

  // DEDUCT CREDITS
  app.post("/api/credits/deduct", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const { type } = req.body;

      if (!type || !["NEW_CHAT", "BOT_RESPONSE", "IMAGE_GENERATION"].includes(type)) {
        return res.status(400).json({ message: "Invalid credit deduction type" });
      }

      // Map type to credit amount
      const creditAmounts = {
        "NEW_CHAT": 2,
        "BOT_RESPONSE": 1,
        "IMAGE_GENERATION": 5
      };

      const amount = creditAmounts[type as keyof typeof creditAmounts];

      try {
        const remainingCredits = await storage.deductCredits!(userId, amount, type);
        const user = await storage.getUserCreditsDetails!(userId);

        res.json({
          success: true,
          remainingCredits,
          usedCredits: (user?.totalCredits || 40) - remainingCredits,
          maxCredits: user?.totalCredits || 40
        });
      } catch (error: any) {
        if (error.message === "Insufficient credits") {
          return res.status(403).json({ success: false, error: "Insufficient credits" });
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Deduct credits error:", error);
      res.status(500).json({ message: error.message || "Failed to deduct credits" });
    }
  });

  // RESET CREDITS
  app.post("/api/credits/reset", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      await storage.resetCreditsForUser!(userId);
      res.json({ message: "Credits reset successfully" });
    } catch (error: any) {
      console.error("Reset credits error:", error);
      res.status(500).json({ message: error.message || "Failed to reset credits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
