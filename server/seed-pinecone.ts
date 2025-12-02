import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }
}

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'ayurveda-bot';
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || 'default';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!PINECONE_API_KEY) {
    console.error('❌ PINECONE_API_KEY is missing!');
    process.exit(1);
}

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing!');
    process.exit(1);
}

console.log('🚀 Initializing Pinecone Data Seeder...\n');

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const homeRemedies = require("./data/home_remedies.json");

// Sample Ayurvedic knowledge base
const ayurvedicKnowledge = [
    ...homeRemedies,
    {
        id: 'ayurveda-intro-1',
        title: 'What is Ayurveda?',
        content: 'Ayurveda is an ancient Indian system of medicine that dates back over 5,000 years. The word Ayurveda comes from Sanskrit: "Ayur" meaning life and "Veda" meaning knowledge or science. It is a holistic approach to health that emphasizes balance between mind, body, and spirit. Ayurveda views health as a state of balance among the three doshas (Vata, Pitta, and Kapha) and disease as an imbalance.',
        category: 'general',
    },
    {
        id: 'tridosha-1',
        title: 'The Three Doshas',
        content: 'The three doshas are fundamental principles in Ayurveda: 1) Vata (air and space) governs movement, breathing, and circulation. 2) Pitta (fire and water) controls digestion, metabolism, and transformation. 3) Kapha (earth and water) provides structure, lubrication, and stability. Each person has a unique combination of these doshas, called Prakriti.',
        category: 'principles',
    },
    {
        id: 'vata-dosha-1',
        title: 'Vata Dosha Characteristics',
        content: 'Vata dosha is composed of air and space elements. People with dominant Vata are typically creative, energetic, and quick-thinking. Physical characteristics include light body frame, dry skin, and cold hands/feet. When balanced, Vata promotes creativity and flexibility. When imbalanced, it can cause anxiety, insomnia, constipation, and dry skin. Vata is aggravated by cold, dry weather, irregular routines, and excessive travel.',
        category: 'doshas',
    },
    {
        id: 'pitta-dosha-1',
        title: 'Pitta Dosha Characteristics',
        content: 'Pitta dosha is composed of fire and water elements. Pitta-dominant individuals are typically intelligent, focused, and goal-oriented. Physical characteristics include medium build, warm body temperature, and strong digestion. When balanced, Pitta promotes intelligence and courage. When imbalanced, it can cause anger, inflammation, heartburn, and skin rashes. Pitta is aggravated by hot weather, spicy foods, and excessive competition.',
        category: 'doshas',
    },
    {
        id: 'kapha-dosha-1',
        title: 'Kapha Dosha Characteristics',
        content: 'Kapha dosha is composed of earth and water elements. Kapha-dominant people are typically calm, stable, and nurturing. Physical characteristics include sturdy build, smooth skin, and slow metabolism. When balanced, Kapha promotes strength and stability. When imbalanced, it can cause weight gain, lethargy, congestion, and depression. Kapha is aggravated by cold, damp weather, excessive sleep, and heavy foods.',
        category: 'doshas',
    },
    {
        id: 'ashwagandha-1',
        title: 'Ashwagandha - The Indian Ginseng',
        content: 'Ashwagandha (Withania somnifera) is one of the most powerful herbs in Ayurveda. Known as an adaptogen, it helps the body manage stress. Benefits include: reducing anxiety and stress, improving brain function, boosting testosterone and fertility in men, increasing muscle mass and strength, reducing inflammation, and improving sleep quality. Typical dosage is 300-500mg of root extract twice daily. It balances Vata and Kapha doshas.',
        category: 'herbs',
    },
    {
        id: 'turmeric-1',
        title: 'Turmeric - The Golden Spice',
        content: 'Turmeric (Curcuma longa) is a powerful anti-inflammatory and antioxidant herb. The active compound curcumin provides numerous health benefits: reduces inflammation, improves brain function, lowers risk of heart disease, helps prevent cancer, and aids in treating depression. In Ayurveda, turmeric balances all three doshas. It can be consumed as golden milk (turmeric latte), added to food, or taken as a supplement (500-2000mg daily with black pepper for absorption).',
        category: 'herbs',
    },
    {
        id: 'triphala-1',
        title: 'Triphala - The Three Fruits',
        content: 'Triphala is a traditional Ayurvedic formulation consisting of three fruits: Amalaki (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula). Benefits include: gentle detoxification, improved digestion, relief from constipation, antioxidant properties, immune support, and eye health. Triphala balances all three doshas. Typical dosage is 500-1000mg before bed or 1-2 teaspoons of powder with warm water.',
        category: 'herbs',
    },
    {
        id: 'brahmi-1',
        title: 'Brahmi - Brain Tonic',
        content: 'Brahmi (Bacopa monnieri) is a renowned brain tonic in Ayurveda. Benefits include: enhanced memory and learning, reduced anxiety and stress, improved focus and concentration, neuroprotective properties, and support for ADHD symptoms. Brahmi balances all three doshas, particularly Pitta. It can be consumed as tea, powder (300-450mg daily), or fresh leaves. Effects are typically seen after 4-6 weeks of consistent use.',
        category: 'herbs',
    },
    {
        id: 'dinacharya-1',
        title: 'Dinacharya - Daily Ayurvedic Routine',
        content: 'Dinacharya is the Ayurvedic daily routine for optimal health. Key practices include: 1) Wake up before sunrise (Brahma muhurta, 4-6 AM), 2) Eliminate waste and clean teeth, 3) Tongue scraping to remove toxins, 4) Oil pulling with sesame or coconut oil, 5) Self-massage (Abhyanga) with warm oil, 6) Yoga and meditation, 7) Bathing, 8) Eating meals at regular times, 9) Going to bed by 10 PM. Following Dinacharya helps maintain dosha balance and prevents disease.',
        category: 'lifestyle',
    },
    {
        id: 'abhyanga-1',
        title: 'Abhyanga - Self-Massage',
        content: 'Abhyanga is the Ayurvedic practice of self-massage with warm oil. Benefits include: nourishing the skin, improving circulation, calming the nervous system, promoting better sleep, and balancing doshas. Use sesame oil for Vata, coconut oil for Pitta, and mustard or sunflower oil for Kapha. Warm the oil, massage in circular motions on joints and long strokes on limbs, leave for 15-20 minutes, then shower. Practice daily or 3-4 times per week.',
        category: 'practices',
    },
    {
        id: 'agni-1',
        title: 'Agni - Digestive Fire',
        content: 'Agni is the digestive fire in Ayurveda, responsible for transforming food into energy and consciousness. Strong Agni leads to good health, while weak Agni causes disease. Signs of strong Agni: good appetite, regular bowel movements, clear skin, and high energy. Signs of weak Agni: bloating, gas, constipation, and fatigue. To strengthen Agni: eat warm, cooked foods; use digestive spices (ginger, cumin, fennel); avoid overeating; and eat at regular times.',
        category: 'principles',
    },
    {
        id: 'ama-1',
        title: 'Ama - Toxins and Waste',
        content: 'Ama is the accumulation of undigested food and toxins in the body, considered the root cause of disease in Ayurveda. Signs of Ama: white coating on tongue, bad breath, fatigue, brain fog, and digestive issues. Ama is caused by weak Agni, overeating, eating incompatible foods, and irregular eating habits. To remove Ama: fast or eat light foods, drink warm water with ginger, practice Panchakarma detox, and strengthen digestive fire.',
        category: 'principles',
    },
    {
        id: 'prakriti-1',
        title: 'Prakriti - Your Unique Constitution',
        content: 'Prakriti is your unique mind-body constitution determined at conception. It remains constant throughout life and represents your natural state of balance. Understanding your Prakriti helps you make appropriate lifestyle and dietary choices. There are seven main types: Vata, Pitta, Kapha, Vata-Pitta, Pitta-Kapha, Vata-Kapha, and Tridoshic (all three balanced). A qualified Ayurvedic practitioner can assess your Prakriti through pulse diagnosis, observation, and questionnaires.',
        category: 'principles',
    },
    {
        id: 'ginger-1',
        title: 'Ginger - Universal Medicine',
        content: 'Ginger (Zingiber officinale) is called "Vishwabhesaj" or universal medicine in Ayurveda. Benefits include: improving digestion, reducing nausea, relieving pain and inflammation, boosting immunity, and enhancing circulation. Ginger balances Vata and Kapha while slightly increasing Pitta. Use fresh ginger in cooking, make ginger tea, or take as a supplement. A simple digestive aid: chew a slice of fresh ginger with rock salt before meals.',
        category: 'herbs',
    },
    {
        id: 'ghee-1',
        title: 'Ghee - Clarified Butter',
        content: 'Ghee is clarified butter and considered a sacred food in Ayurveda. Benefits include: improving digestion and absorption, nourishing all tissues, enhancing memory and intelligence, promoting longevity, and balancing Vata and Pitta doshas. Ghee is used in cooking, as a carrier for herbs, and in Panchakarma therapies. Quality matters - use organic, grass-fed ghee. Consume 1-2 teaspoons daily for optimal health.',
        category: 'nutrition',
    },
    {
        id: 'meditation-1',
        title: 'Meditation in Ayurveda',
        content: 'Meditation (Dhyana) is essential in Ayurveda for mental and spiritual health. Benefits include: reducing stress and anxiety, balancing all three doshas, improving focus and clarity, enhancing self-awareness, and promoting emotional balance. Best time to meditate is early morning (Brahma muhurta). Start with 5-10 minutes daily and gradually increase. Techniques include breath awareness, mantra meditation, and mindfulness. Regular practice is more important than duration.',
        category: 'practices',
    },
    {
        id: 'panchakarma-1',
        title: 'Panchakarma - Detoxification Therapy',
        content: 'Panchakarma is the ultimate Ayurvedic detoxification and rejuvenation program. The five main procedures are: 1) Vamana (therapeutic vomiting), 2) Virechana (purgation), 3) Basti (medicated enema), 4) Nasya (nasal administration), and 5) Raktamokshana (bloodletting). Panchakarma removes deep-seated toxins, balances doshas, and restores health. It should be done under supervision of a qualified Ayurvedic practitioner, typically during seasonal transitions.',
        category: 'treatments',
    },
    {
        id: 'yoga-ayurveda-1',
        title: 'Yoga and Ayurveda Connection',
        content: 'Yoga and Ayurveda are sister sciences from ancient India. While Ayurveda focuses on physical health, Yoga emphasizes spiritual development. Together they provide complete wellness. Vata types benefit from grounding, slow-paced yoga (Hatha, Yin). Pitta types need cooling, moderate practices (Yin, gentle Vinyasa). Kapha types require energizing, vigorous yoga (Ashtanga, Power Yoga). Practice yoga in the morning for best results, ideally after Abhyanga and before breakfast.',
        category: 'practices',
    },
    {
        id: 'seasonal-routine-1',
        title: 'Ritucharya - Seasonal Routines',
        content: 'Ritucharya is the Ayurvedic practice of adjusting lifestyle and diet according to seasons. Spring (Kapha season): light, dry foods; vigorous exercise. Summer (Pitta season): cooling foods; moderate activity. Fall (Vata season): warm, grounding foods; calming practices. Winter (Kapha season): warming spices; regular exercise. Following Ritucharya prevents seasonal imbalances and maintains health throughout the year.',
        category: 'lifestyle',
    },
];

async function generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function seedPinecone() {
    try {
        console.log(`📊 Connecting to Pinecone index: ${PINECONE_INDEX}...\n`);
        const index = pinecone.index(PINECONE_INDEX);

        console.log(`📝 Preparing to seed ${ayurvedicKnowledge.length} documents...\n`);

        const vectors = [];

        for (let i = 0; i < ayurvedicKnowledge.length; i++) {
            const doc = ayurvedicKnowledge[i];
            console.log(`[${i + 1}/${ayurvedicKnowledge.length}] Processing: ${doc.title}`);

            // Generate embedding for the content
            const textToEmbed = `${doc.title}\n\n${doc.content}`;
            const embedding = await generateEmbedding(textToEmbed);

            vectors.push({
                id: doc.id,
                values: embedding,
                metadata: {
                    title: doc.title,
                    text: doc.content,
                    category: doc.category,
                },
            });

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\n🚀 Uploading ${vectors.length} vectors to Pinecone...`);

        // Upsert vectors in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.namespace(PINECONE_NAMESPACE).upsert(batch);
            console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1}`);
        }

        console.log('\n✅ Successfully seeded Pinecone with Ayurvedic knowledge!');
        console.log(`📊 Total documents: ${ayurvedicKnowledge.length}`);
        console.log(`🔍 Index: ${PINECONE_INDEX}`);
        console.log(`📁 Namespace: ${PINECONE_NAMESPACE}`);
        console.log('\n🎉 Your RAG pipeline is now ready to use!\n');

    } catch (error: any) {
        console.error('\n❌ Error seeding Pinecone:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the seeder
seedPinecone();
