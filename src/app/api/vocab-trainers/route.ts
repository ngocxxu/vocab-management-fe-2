import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vocabTrainerApi } from '@/utils/server-api';

// GET /api/vocab-trainers - Get all vocab trainers
export async function GET(_request: NextRequest) {
  try {
    const trainers = await vocabTrainerApi.getAll();
    return NextResponse.json(trainers);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vocab trainers' },
      { status: 500 },
    );
  }
}

// POST /api/vocab-trainers - Create new vocab trainer
export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json();
    const newTrainer = await vocabTrainerApi.create(body);
    return NextResponse.json(newTrainer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vocab trainer' },
      { status: 500 },
    );
  }
}
