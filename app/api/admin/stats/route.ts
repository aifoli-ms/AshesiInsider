//@Divine Kwawukume

import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin database client not configured' }, { status: 500 });
        }

        // Fetch counts in parallel
        const [
            { count: adminCount },
            { count: appUsersCount },
            { count: coursesCount },
            { count: restaurantsCount },
            { count: hostelsCount },
            { count: lecturersCount },
            { count: courseReviews },
            { count: restaurantReviews },
            { count: hostelReviews },
            { count: lecturerReviews }
        ] = await Promise.all([
            supabaseAdmin.from('admin').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('app_users').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('restaurants').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('hostels').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('lecturers').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('course_reviews').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('restaurant_reviews').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('hostel_reviews').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('lecturer_reviews').select('*', { count: 'exact', head: true }),
        ]);

        const totalUsers = (adminCount || 0) + (appUsersCount || 0);
        const totalReviews = (courseReviews || 0) + (restaurantReviews || 0) + (hostelReviews || 0) + (lecturerReviews || 0);

        return NextResponse.json({
            users: totalUsers || 0,
            courses: coursesCount || 0,
            restaurants: restaurantsCount || 0,
            hostels: hostelsCount || 0,
            lecturers: lecturersCount || 0,
            reviews: totalReviews,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
