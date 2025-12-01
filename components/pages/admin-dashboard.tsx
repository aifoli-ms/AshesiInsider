//@Divine Kwawukume
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

interface Course {
    id: number;
    code: string;
    name: string;
    instructor: string;
    rating: number;
    reviews_count: number;
}

interface Lecturer {
    id: number;
    name: string;
    department: string;
    rating: number;
    reviews_count: number;
}

interface Restaurant {
    id: number;
    name: string;
    location: string;
    rating: number;
    reviews_count: number;
}

interface Hostel {
    id: number;
    name: string;
    location: string;
    rating: number;
    reviews_count: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);

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

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses');
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchLecturers = async () => {
        try {
            const res = await fetch('/api/admin/lecturers');
            if (res.ok) {
                const data = await res.json();
                setLecturers(data.lecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await fetch('/api/admin/restaurants');
            if (res.ok) {
                const data = await res.json();
                setRestaurants(data.restaurants);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchHostels = async () => {
        try {
            const res = await fetch('/api/admin/hostels');
            if (res.ok) {
                const data = await res.json();
                setHostels(data.hostels);
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}&action=delete_user`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                void fetchStats();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };





    const handleDeleteReview = async (id: number, table: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`/api/admin/reviews?id=${id}&table=${table}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
                void fetchStats();
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleDeleteEntity = async (id: number, type: 'courses' | 'lecturers' | 'restaurants' | 'hostels') => {
        if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
        try {
            const res = await fetch(`/api/admin/${type}?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (type === 'courses') setCourses(courses.filter(i => i.id !== id));
                if (type === 'lecturers') setLecturers(lecturers.filter(i => i.id !== id));
                if (type === 'restaurants') setRestaurants(restaurants.filter(i => i.id !== id));
                if (type === 'hostels') setHostels(hostels.filter(i => i.id !== id));
                void fetchStats();
            } else {
                alert(`Failed to delete ${type.slice(0, -1)}`);
            }
        } catch (error) {
            console.error(`Error deleting ${type.slice(0, -1)}:`, error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchUsers(),
                fetchReviews(),
                fetchCourses(),
                fetchLecturers(),
                fetchRestaurants(),
                fetchHostels()
            ]);
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
                        <TabsTrigger value="courses">Manage Courses</TabsTrigger>
                        <TabsTrigger value="lecturers">Manage Lecturers</TabsTrigger>
                        <TabsTrigger value="restaurants">Manage Restaurants</TabsTrigger>
                        <TabsTrigger value="hostels">Manage Hostels</TabsTrigger>
                        <TabsTrigger value="reviews">Manage Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>Users & Admins</CardTitle>
                            </CardHeader>
                            <CardContent>


                                {/* Users Table */}
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
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.role === 'admin'}
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

                    <TabsContent value="courses">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 font-semibold">Code</th>
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Instructor</th>
                                                <th className="p-4 font-semibold">Rating</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => (
                                                <tr key={course.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{course.code}</td>
                                                    <td className="p-4">{course.name}</td>
                                                    <td className="p-4 text-muted-foreground">{course.instructor || 'N/A'}</td>
                                                    <td className="p-4">{course.rating}/5 ({course.reviews_count})</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteEntity(course.id, 'courses')}
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

                    <TabsContent value="lecturers">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Lecturers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Department</th>
                                                <th className="p-4 font-semibold">Rating</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lecturers.map((lecturer) => (
                                                <tr key={lecturer.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{lecturer.name}</td>
                                                    <td className="p-4 text-muted-foreground">{lecturer.department || 'N/A'}</td>
                                                    <td className="p-4">{lecturer.rating}/5 ({lecturer.reviews_count})</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteEntity(lecturer.id, 'lecturers')}
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

                    <TabsContent value="restaurants">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Restaurants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Location</th>
                                                <th className="p-4 font-semibold">Rating</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {restaurants.map((restaurant) => (
                                                <tr key={restaurant.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{restaurant.name}</td>
                                                    <td className="p-4 text-muted-foreground">{restaurant.location || 'N/A'}</td>
                                                    <td className="p-4">{restaurant.rating}/5 ({restaurant.reviews_count})</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteEntity(restaurant.id, 'restaurants')}
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

                    <TabsContent value="hostels">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Hostels</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 font-semibold">Name</th>
                                                <th className="p-4 font-semibold">Location</th>
                                                <th className="p-4 font-semibold">Rating</th>
                                                <th className="p-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hostels.map((hostel) => (
                                                <tr key={hostel.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{hostel.name}</td>
                                                    <td className="p-4 text-muted-foreground">{hostel.location || 'N/A'}</td>
                                                    <td className="p-4">{hostel.rating}/5 ({hostel.reviews_count})</td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteEntity(hostel.id, 'hostels')}
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
