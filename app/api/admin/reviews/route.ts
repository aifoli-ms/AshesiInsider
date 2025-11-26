import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { SESSION_COOKIE, parseSessionToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Auth check
        const token = req.cookies.get(SESSION_COOKIE)?.value;
        const session = token ? parseSessionToken(token) : null;

        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseServer) {
            return NextResponse.json({ error: 'Database client not configured' }, { status: 500 });
        }

        // Fetch recent reviews from all tables
        // This is a bit complex to paginate across tables, so we'll just fetch latest 10 from each and combine/sort
        const limit = 10;

        const [
            { data: courseReviews },
            { data: restaurantReviews },
            { data: hostelReviews },
            { data: lecturerReviews },
        ] = await Promise.all([
            supabaseServer.from('course_reviews').select('*, courses(name)').order('created_at', { ascending: false }).limit(limit),
            supabaseServer.from('restaurant_reviews').select('*, restaurants(name)').order('created_at', { ascending: false }).limit(limit),
            supabaseServer.from('hostel_reviews').select('*, hostels(name)').order('created_at', { ascending: false }).limit(limit),
            supabaseServer.from('lecturer_reviews').select('*, lecturers(name)').order('created_at', { ascending: false }).limit(limit),
        ]);

        const formatReview = (r: any, type: string, itemName: string) => ({
            id: r.id,
            type,
            itemName,
            author: r.author,
            rating: r.rating,
            title: r.title,
            content: r.content,
            created_at: r.created_at,
            table: `${type}_reviews` // for deletion
        });

        const allReviews = [
            ...(courseReviews || []).map(r => formatReview(r, 'course', r.courses?.name)),
            ...(restaurantReviews || []).map(r => formatReview(r, 'restaurant', r.restaurants?.name)),
            ...(hostelReviews || []).map(r => formatReview(r, 'hostel', r.hostels?.name)),
            ...(lecturerReviews || []).map(r => formatReview(r, 'lecturer', r.lecturers?.name)),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20); // Return top 20 combined

        return NextResponse.json({ reviews: allReviews });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Auth check
        const token = req.cookies.get(SESSION_COOKIE)?.value;
        const session = token ? parseSessionToken(token) : null;

        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const table = searchParams.get('table');

        if (!id || !table) {
            return NextResponse.json({ error: 'Missing ID or table' }, { status: 400 });
        }

        // Validate table name to prevent SQL injection via table name (though Supabase client handles it, better safe)
        const validTables = ['course_reviews', 'restaurant_reviews', 'hostel_reviews', 'lecturer_reviews'];
        if (!validTables.includes(table)) {
            return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
        }

        if (!supabaseServer) {
            return NextResponse.json({ error: 'Database client not configured' }, { status: 500 });
        }

        const { error } = await supabaseServer
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
