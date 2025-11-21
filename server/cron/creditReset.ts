import cron from 'node-cron';
import { storage } from '../storage';

// Run every day at 02:00 UTC
cron.schedule('0 2 * * *', async () => {
    console.log('Running daily credit reset check...');
    try {
        await storage.resetCreditsForAllUsers!(40);
        console.log('Daily credit reset check completed.');
    } catch (error) {
        console.error('Error running daily credit reset:', error);
    }
});
