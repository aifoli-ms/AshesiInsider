'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Users, BookOpen, Utensils, Building2, GraduationCap, MessageSquare } from 'lucide-react';

interface Stats {
    users: number;
    courses: number;
    restaurants: number;
    hostels: number;
    lecturers: number;
    reviews: number;
}

interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Review {
    id: number;
    type: string;
    itemName: string;
    author: string;
    rating: number;
    title: string;
    content: string;
    created_at: string;
    table: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [addingAdmin, setAddingAdmin] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}&action=delete_user`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                void fetchStats(); // Refresh stats
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleToggleAdmin = async (user: User) => {
        if (user.role === 'admin') {
            if (!confirm(`Remove admin privileges from ${user.full_name}?`)) return;
            try {
                const res = await fetch(`/api/admin/users?email=${user.email}&action=remove_admin`, { method: 'DELETE' });
                if (res.ok) {
                    setUsers(users.map(u => u.id === user.id ? { ...u, role: 'user' } : u));
                } else {
                    alert('Failed to remove admin');
                }
            } catch (error) {
                console.error('Error removing admin:', error);
            }
        } else {
            // Add admin
            // We need a UI for this, but here we are toggling existing user.
            // Let's just use the add admin flow for consistency or allow direct toggle here.
            // Direct toggle is easier for existing users.
            if (!confirm(`Make ${user.full_name} an admin?`)) return;
            try {
                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email }),
                });
                if (res.ok) {
                    setUsers(users.map(u => u.id === user.id ? { ...u, role: 'admin' } : u));
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to add admin');
                }
            } catch (error) {
                console.error('Error adding admin:', error);
            }
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail || !newAdminPassword) return;
        setAddingAdmin(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
            });
            if (res.ok) {
                alert('Admin added successfully');
                setNewAdminEmail('');
                setNewAdminPassword('');
                void fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add admin');
            }
        } catch (error) {
            console.error('Error adding admin:', error);
        } finally {
            setAddingAdmin(false);
        }
    };

    const handleDeleteReview = async (id: number, table: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`/api/admin/reviews?id=${id}&table=${table}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
                void fetchStats(); // Refresh stats
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers(), fetchReviews()]);
            setLoading(false);
        };
        void loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl font-semibold text-muted-foreground">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-secondary">Admin Dashboard</h1>
                    <Button onClick={() => window.location.reload()} variant="outline">Refresh Data</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <StatsCard title="Total Users" value={stats?.users} icon={<Users className="h-8 w-8 text-blue-500" />} />
                    <StatsCard title="Total Reviews" value={stats?.reviews} icon={<MessageSquare className="h-8 w-8 text-green-500" />} />
                    <StatsCard title="Courses" value={stats?.courses} icon={<BookOpen className="h-8 w-8 text-purple-500" />} />
                    <StatsCard title="Restaurants" value={stats?.restaurants} icon={<Utensils className="h-8 w-8 text-orange-500" />} />
                    <StatsCard title="Hostels" value={stats?.hostels} icon={<Building2 className="h-8 w-8 text-indigo-500" />} />
                    <StatsCard title="Lecturers" value={stats?.lecturers} icon={<GraduationCap className="h-8 w-8 text-red-500" />} />
                </div>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="users">Manage Users</TabsTrigger>
                        <TabsTrigger value="reviews">Manage Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Users & Admins</CardTitle>
                                <form onSubmit={handleAddAdmin} className="flex gap-2 items-center">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        className="px-3 py-2 border rounded-md text-sm w-48"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        className="px-3 py-2 border rounded-md text-sm w-48"
                                        required
                                    />
                                    <Button type="submit" disabled={addingAdmin} size="sm">
                                        {addingAdmin ? 'Adding...' : 'Add Admin'}
                                    </Button>
                                </form>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Email</th>
                                                <th className="p-4 font-semibold">Role</th>
                                                <th className="p-4 font-semibold">Joined</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{user.full_name || 'N/A'}</td>
                                                    <td className="p-4 text-muted-foreground">{user.email}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {user.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleAdmin(user)}
                                                            className={user.role === 'admin' ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}
                                                        >
                                                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.role === 'admin'} // Prevent deleting admins for safety
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={`${review.type}-${review.id}`} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${review.type === 'course' ? 'bg-purple-100 text-purple-800' :
                                                        review.type === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                                                            review.type === 'hostel' ? 'bg-indigo-100 text-indigo-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {review.type}
                                                    </span>
                                                    <span className="font-semibold text-sm">{review.itemName}</span>
                                                    <span className="text-xs text-muted-foreground">• {new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold">{review.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    By: {review.author} • Rating: {review.rating}/5
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 ml-4"
                                                onClick={() => handleDeleteReview(review.id, review.table)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}

function StatsCard({ title, value, icon }: { title: string; value?: number; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-black">{value ?? '-'}</h3>
                </div>
                <div className="p-3 bg-muted rounded-full">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
