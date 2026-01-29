
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

async function listModels() {
    console.log('🔍 Checking available Gemini models...');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data: any = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error);
            return;
        }

        if (!data.models) {
            console.log('⚠️ No models found in response');
            return;
        }

        console.log('\n📋 Available Models:');
        const bidiModels = data.models.filter((m: any) =>
            m.supportedGenerationMethods?.includes('bidiGenerateContent') ||
            m.name.includes('flash') ||
            m.name.includes('realtime')
        );

        bidiModels.forEach((model: any) => {
            console.log(`\n🔹 Name: ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        });

    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

listModels();
