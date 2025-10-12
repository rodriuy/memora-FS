'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-audio-story.ts';
import '@/ai/flows/generate-animated-photo.ts';
import '@/ai/flows/anonymize-story-for-donation.ts';
import '@/ai/flows/generate-profile-photo.ts';
