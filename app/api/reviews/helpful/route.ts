//@Shaun Esua - Mensah
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { reviewId, type, action } = body;

        if (!reviewId || !type) {
            return NextResponse.json({ error: 'Missing reviewId or type' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const tableMap: Record<string, string> = {
            course: 'course_reviews',
            restaurant: 'restaurant_reviews',
            lecturer: 'lecturer_reviews',
            hostel: 'hostel_reviews',
        };

        const tableName = tableMap[type];
        if (!tableName) {
            return NextResponse.json({ error: 'Invalid review type' }, { status: 400 });
        }

        // RPC call would be ideal for atomic increment, but for now we can fetch and update.
        // Or better, use the .rpc() if we had a function.
        // Since we don't have a specific RPC for this, we'll do a read-update-write or just update.
        // Actually, we can use the `rpc` method if we create a postgres function, but let's stick to simple update for now
        // assuming low concurrency or acceptable race conditions for "helpful" counts.
        // Wait, Supabase/PostgREST doesn't support `increment` directly in `update` without a custom function or raw SQL.
        // But `supabaseAdmin` is a supabase-js client.

        // Let's try to fetch current first.
        const { data: current, error: fetchError } = await supabaseAdmin
            .from(tableName)
            .select('helpful')
            .eq('id', reviewId)
            .single();

        if (fetchError || !current) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        let newCount = current.helpful || 0;
        if (action === 'unlike') {
            newCount = Math.max(0, newCount - 1);
        } else {
            newCount = newCount + 1;
        }

        const { data, error: updateError } = await supabaseAdmin
            .from(tableName)
            .update({ helpful: newCount })
            .eq('id', reviewId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ count: newCount });
    } catch (error: any) {
        console.error('Helpful update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
