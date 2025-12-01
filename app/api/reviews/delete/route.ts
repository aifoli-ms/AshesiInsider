//@Shaun Esua - Mensah
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        // Validate Session
        const token = req.cookies.get(SESSION_COOKIE)?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = parseSessionToken(token);
        if (!session) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Parse Body
        const body = await req.json();
        const { reviewId, type } = body;

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

      
        const { data: review, error: fetchError } = await supabaseAdmin
            .from(tableName)
            .select('author')
            .eq('id', reviewId)
            .single();

        if (fetchError || !review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        const userAuthorName = session.firstName || session.email.split('@')[0];

   
        if (review.author !== userAuthorName && review.author !== 'Anonymous') {
          
            if (review.author !== userAuthorName) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Delete Review
        const { error: deleteError } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('id', reviewId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
