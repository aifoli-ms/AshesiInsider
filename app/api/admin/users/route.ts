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

        const [
            { data: users, error: usersError },
            { data: admins, error: adminsError }
        ] = await Promise.all([
            supabaseServer
                .from('profiles')
                .select('id, full_name, email, created_at')
                .order('created_at', { ascending: false }),
            supabaseServer
                .from('admins')
                .select('email')
        ]);

        if (usersError) {
            return NextResponse.json({ error: usersError.message }, { status: 500 });
        }

        const adminEmails = new Set((admins || []).map(a => a.email));

        const usersWithRole = (users || []).map(u => ({
            ...u,
            role: adminEmails.has(u.email) ? 'admin' : 'user'
        }));

        return NextResponse.json({ users: usersWithRole });
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

        // Check if we are deleting an admin
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');
        const action = searchParams.get('action'); // 'delete_user' or 'remove_admin'

        if (!supabaseServer) {
            return NextResponse.json({ error: 'Database client not configured' }, { status: 500 });
        }

        if (action === 'remove_admin' && email) {
            const { error } = await supabaseServer
                .from('admins')
                .delete()
                .eq('email', email);

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_user' && id) {
            const { error } = await supabaseServer
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const token = req.cookies.get(SESSION_COOKIE)?.value;
        const session = token ? parseSessionToken(token) : null;

        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (!supabaseServer) {
            return NextResponse.json({ error: 'Database client not configured' }, { status: 500 });
        }

        // Insert into admins table with hashed password
        // We use pgcrypto's crypt function in the insert query
        // But supabase-js insert doesn't support raw SQL functions easily in values.
        // We can use an RPC or we can use `upsert` if we had a function, but standard insert expects values.
        // Wait, Supabase client doesn't let me call `crypt()` inside `.insert()`.
        // I need to use an RPC to insert with password hashing, OR I can use a raw query if I had a way (I don't via supabase-js easily without RPC).

        // Let's create an RPC for creating an admin.
        // Actually, I can just use the `pgcrypto` extension in a `create_admin` RPC.
        // Let's define that RPC in the migration or just use `rpc` call here if I defined it.
        // I haven't defined `create_admin` RPC yet.
        // I should probably define it in the migration 0010.
        // But I already wrote 0010. I can append to it or just use a new migration?
        // Or I can just use `supabaseServer.rpc('create_admin', ...)` if I add it now.

        // Let's add `create_admin` RPC to the migration file 0010 via a separate tool call first?
        // Or I can just try to do it here if I had it.
        // I should update the migration file first.

        // But wait, I can't update the migration file easily if I already marked it done.
        // I can just append to it.
        // Let's assume I will add `create_admin` RPC.

        const { error } = await supabaseServer.rpc('create_admin', {
            _email: email,
            _password: password
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

