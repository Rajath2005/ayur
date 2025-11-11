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

  app.post("/api/conversations", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Check and deduct 2 credits for creating conversation
      const currentCredits = await storage.getUserCredits!(userId);
      if (currentCredits < 2) {
        return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
      }
      const newCredits = await storage.deductCredits!(userId, 2, "create_conversation");

      const data = {
        userId,
        title: req.body.title,
      };
      const conversation = await storage.createConversation(data);
      res.json({ ...conversation, credits: newCredits });
    } catch (error: any) {
      console.error("Create conversation error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Failed to create conversation" });
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

      // Check credits before proceeding
      const currentCredits = await storage.getUserCredits!(userId);
      console.log("[CREDITS BEFORE]", currentCredits);
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
      console.log("[AI RESPONSE]", aiResponse.content);

      // Deduct credits only after successful AI response
      const newCredits = await storage.deductCredits!(userId, 1, "send_message");
      console.log("[CREDITS AFTER]", newCredits);

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
      const currentCredits = await storage.getUserCredits!(userId);
      if (currentCredits < 2) {
        return res.status(403).json({ error: "NO_CREDITS", credits: currentCredits });
      }
      const newCredits = await storage.deductCredits!(userId, 2, "create_image_chat_session");

      const data = {
        userId,
        title: req.body.title,
      };
      const session = await storage.createConversation(data);
      res.json({ ...session, credits: newCredits });
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
      console.log("[IMAGE CHAT CREDITS BEFORE]", currentCredits);
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

      console.log("[IMAGE CHAT AI RESPONSE]", aiResponse.content);

      // Deduct credits only after successful AI response
      const newCredits = await storage.deductCredits!(userId, 1, "send_image_message");
      console.log("[IMAGE CHAT CREDITS AFTER]", newCredits);

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
      res.json({ credits, maxCredits: 40 });
    } catch (error: any) {
      console.error("Get credits error:", error);
      res.status(500).json({ message: error.message || "Failed to get credits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}