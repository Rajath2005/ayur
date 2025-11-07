import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
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
import { verifyFirebaseToken, type AuthRequest } from "./middleware/verifyFirebaseToken";

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
      const data = insertConversationSchema.parse({
        ...req.body,
        userId,
      });

      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error: any) {
      console.error("Create conversation error:", error);
      res.status(400).json({ message: error.message || "Failed to create conversation" });
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
  app.get("/api/messages/:conversationId", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
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

  // CHAT ROUTE (with AI response)
  app.post("/api/chat", verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;
      const data = chatMessageSchema.parse(req.body);

      // Verify conversation belongs to user
      const conversation = await storage.getConversation(data.conversationId);
      if (!conversation || conversation.userId !== userId) {
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

  const httpServer = createServer(app);
  return httpServer;
}
