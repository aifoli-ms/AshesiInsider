'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, BookOpen, UtensilsCrossed, Users, HomeIcon, Star, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfilePageProps {
    onNavigate: (page: string) => void;
}

interface Review {
    id: number;
    title: string;
    content: string;
    rating: number;
    created_at: string;
    item_name: string;
    type: 'course' | 'restaurant' | 'lecturer' | 'hostel';
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
    const [user, setUser] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'course' | 'restaurant' | 'lecturer' | 'hostel'>('all');
    const [reviewToDelete, setReviewToDelete] = useState<{ id: number, type: Review['type'] } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                
                const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
                if (!sessionRes.ok) {
                    setLoading(false);
                    return;
                }
                const sessionData = await sessionRes.json();
                const userData = sessionData.user;
                setUser(userData);

                if (!userData || !supabase) {
                    setLoading(false);
                    return;
                }

               
                const authorName = userData.firstName || userData.email?.split('@')[0] || 'Anonymous';

                const tables = [
                    { name: 'course_reviews', type: 'course', join: 'courses(name, code)' },
                    { name: 'restaurant_reviews', type: 'restaurant', join: 'restaurants(name)' },
                    { name: 'lecturer_reviews', type: 'lecturer', join: 'lecturers(name)' },
                    { name: 'hostel_reviews', type: 'hostel', join: 'hostels(name)' },
                ] as const;

                const allReviews: Review[] = [];

                for (const t of tables) {
                    const { data, error } = await supabase
                        .from(t.name)
                        .select(`*, ${t.join}`)
                        .eq('author', authorName)
                        .order('created_at', { ascending: false });

                    if (!error && data) {
                        const mapped = data.map((r: any) => {
                            
                            let itemName = 'Unknown Item';
                            if (t.type === 'course' && r.courses) {
                                itemName = `${r.courses.code} - ${r.courses.name}`;
                            } else if (t.type === 'restaurant' && r.restaurants) {
                                itemName = r.restaurants.name;
                            } else if (t.type === 'lecturer' && r.lecturers) {
                                itemName = r.lecturers.name;
                            } else if (t.type === 'hostel' && r.hostels) {
                                itemName = r.hostels.name;
                            }

                            return {
                                id: r.id,
                                title: r.title,
                                content: r.content,
                                rating: r.rating,
                                created_at: r.created_at,
                                item_name: itemName,
                                type: t.type,
                            };
                        });
                        allReviews.push(...mapped);
                    }
                }

                
                allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setReviews(allReviews);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, []);

    const handleDeleteClick = (reviewId: number, type: Review['type']) => {
        setReviewToDelete({ id: reviewId, type });
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        const { id, type } = reviewToDelete;

        try {
            const response = await fetch('/api/reviews/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reviewId: id, type }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete review');
            }

            
            setReviews(prev => prev.filter(r => !(r.id === id && r.type === type)));
        } catch (error: any) {
            console.error('Error deleting review:', error);
            alert(error.message || 'An error occurred while deleting the review.');
        } finally {
            setReviewToDelete(null);
        }
    };

    const filteredReviews = activeTab === 'all'
        ? reviews
        : reviews.filter(r => r.type === activeTab);

    const tabs = [
        { id: 'all', label: 'All Reviews', icon: null },
        { id: 'course', label: 'Courses', icon: BookOpen },
        { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
        { id: 'lecturer', label: 'Lecturers', icon: Users },
        { id: 'hostel', label: 'Hostels', icon: HomeIcon },
    ] as const;

    if (loading) {
        return (
            <div className="min-h-screen bg-background py-12 flex justify-center">
                <div className="text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background py-12 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
                <button
                    onClick={() => onNavigate('home')}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-12">
            <div className="max-w-4xl mx-auto px-4">

                {/* Profile Header */}
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={48} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-black text-card-foreground mb-2">
                            {user.firstName || 'Student'}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            <span className="capitalize">{user.role || 'User'}</span> Account
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="text-3xl font-black text-primary mb-1">{reviews.length}</div>
                        <div className="text-sm text-muted-foreground">Total Reviews</div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">My Reviews</h2>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    {Icon && <Icon size={16} />}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Reviews List */}
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-2xl border border-border border-dashed">
                            <p className="text-muted-foreground">No reviews found in this category.</p>
                            <button
                                onClick={() => onNavigate('courses')}
                                className="mt-4 text-primary font-semibold hover:underline"
                            >
                                Start writing reviews
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReviews.map((review) => (
                                <div key={`${review.type}-${review.id}`} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow relative group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                    review.type === 'course' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                                    review.type === 'restaurant' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                                                    review.type === 'lecturer' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                    review.type === 'hostel' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                                )}>
                                                    {review.type}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-card-foreground">{review.item_name}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
                                                <Star size={16} className="fill-primary text-primary" />
                                                <span className="font-bold">{review.rating}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClick(review.id, review.type)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold mb-2">{review.title}</h4>
                                    <p className="text-muted-foreground text-sm line-clamp-3">{review.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
