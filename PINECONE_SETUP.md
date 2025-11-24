# 🌿 Pinecone RAG Setup Guide for AyuDost AI

This guide will help you set up the advanced 10-step RAG (Retrieval-Augmented Generation) pipeline with Pinecone vector database.

## 📋 Prerequisites

- Node.js installed
- Gemini API key (already configured)
- Pinecone account (free tier available)

## 🚀 Step-by-Step Setup

### Step 1: Create Pinecone Account

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Click **"Sign Up"** and create a free account
3. Verify your email address

### Step 2: Create a Pinecone Index

1. Log in to your Pinecone dashboard
2. Click **"Create Index"** button
3. Configure the index with these **exact** settings:
   - **Index Name**: `ayurveda-bot`
   - **Dimensions**: `768`
   - **Metric**: `cosine`
   - **Cloud Provider**: Select the free tier option (usually AWS us-east-1)
   - **Pod Type**: Starter (free)
4. Click **"Create Index"**
5. Wait for the index to be ready (usually takes 1-2 minutes)

### Step 3: Get Your API Key

1. In the Pinecone dashboard, click on **"API Keys"** in the left sidebar
2. Copy your API key (it starts with `pcsk_...` or similar)

### Step 4: Configure Environment Variables

1. Open the file `server/.env` (create it if it doesn't exist)
2. Add these lines:

```env
# Pinecone Configuration
PINECONE_API_KEY=your_actual_pinecone_api_key_here
PINECONE_INDEX=ayurveda-bot
PINECONE_NAMESPACE=default
```

3. Replace `your_actual_pinecone_api_key_here` with your actual Pinecone API key
4. Save the file

### Step 5: Seed the Vector Database

Run this command to populate Pinecone with Ayurvedic knowledge:

```bash
npm run seed:pinecone
```

This will:
- Connect to your Pinecone index
- Generate embeddings for 20 curated Ayurvedic documents
- Upload them to your vector database
- Takes about 2-3 minutes to complete

You should see output like:
```
🚀 Initializing Pinecone Data Seeder...
📊 Connecting to Pinecone index: ayurveda-bot...
📝 Preparing to seed 20 documents...
[1/20] Processing: What is Ayurveda?
[2/20] Processing: The Three Doshas
...
✅ Successfully seeded Pinecone with Ayurvedic knowledge!
```

### Step 6: Restart Your Server

If your dev server is running, restart it:

```bash
npm run dev
```

## ✅ Verify It's Working

1. Go to your AyuDost AI chat
2. Select **"Ayurveda Gyaan"** mode
3. Ask a question like: **"Tell me about Ashwagandha"**
4. You should see:
   - The RAG progress UI showing 10 steps
   - A detailed answer with information from the knowledge base
   - Server logs showing: `🚀 Starting advanced RAG pipeline with Pinecone...`

## 🔍 Understanding the RAG Pipeline

When you ask a question in Gyaan mode, the system:

1. **Domain Check** - Verifies the query is Ayurvedic
2. **Query Rewriting** - Optimizes the query for better retrieval
3. **Entity Extraction** - Identifies herbs, doshas, conditions
4. **Embeddings** - Converts query to vector representation
5. **Knowledge Search** - Searches Pinecone + MongoDB
6. **Context Ranking** - Ranks results by relevance
7. **Context Preparation** - Prepares context for the AI
8. **Answer Generation** - Gemini generates the answer
9. **Quality Check** - Verifies accuracy
10. **Final Polish** - Adds disclaimers and formatting

## 📊 What's in the Knowledge Base?

The initial seed includes 20 documents covering:

- **Ayurveda Basics**: What is Ayurveda, Tridosha theory
- **Doshas**: Vata, Pitta, Kapha characteristics
- **Herbs**: Ashwagandha, Turmeric, Triphala, Brahmi, Ginger
- **Practices**: Dinacharya, Abhyanga, Meditation, Yoga
- **Principles**: Agni, Ama, Prakriti
- **Treatments**: Panchakarma
- **Nutrition**: Ghee
- **Lifestyle**: Ritucharya (seasonal routines)

## 🔧 Troubleshooting

### Error: "PINECONE_API_KEY is missing"
- Make sure you added the API key to `server/.env`
- Restart your server after adding it

### Error: "Failed to query Pinecone"
- Verify your index name is exactly `ayurveda-bot`
- Check that the index is in "Ready" state in Pinecone dashboard
- Verify your API key is correct

### Error: "Dimension mismatch"
- Your index must have **768 dimensions**
- If you created it with different dimensions, delete and recreate it

### RAG pipeline falls back to simple mode
- Check server logs for specific error messages
- Verify Pinecone index is seeded (run `npm run seed:pinecone` again)
- Check that all environment variables are set correctly

## 📈 Adding More Knowledge

To add more Ayurvedic knowledge to your vector database:

1. Edit `server/seed-pinecone.ts`
2. Add new documents to the `ayurvedicKnowledge` array
3. Run `npm run seed:pinecone` again

Example document format:
```typescript
{
    id: 'unique-id-here',
    title: 'Document Title',
    content: 'Detailed content about the topic...',
    category: 'herbs' | 'doshas' | 'practices' | 'principles' | 'treatments' | 'nutrition' | 'lifestyle' | 'general',
}
```

## 🎯 Best Practices

1. **Keep documents focused** - Each document should cover one specific topic
2. **Use clear titles** - Helps with retrieval accuracy
3. **Add rich content** - More detailed content = better answers
4. **Categorize properly** - Helps with filtering and ranking
5. **Regular updates** - Keep adding new knowledge over time

## 🌟 Next Steps

- Add more Ayurvedic documents to expand the knowledge base
- Integrate MongoDB knowledge base for additional context
- Fine-tune the RAG pipeline parameters for better results
- Monitor query patterns to identify knowledge gaps

## 📞 Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Pinecone index is properly configured
4. Try re-seeding the database

---

**Happy RAG-ing! 🌿✨**
