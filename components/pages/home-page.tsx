'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
	ArrowRight,
	BookOpen,
	HomeIcon,
	Search,
	ChevronDown,
	Sparkles,
	UtensilsCrossed,
	Users,
	MessageSquare,
	ClipboardList,
	Building2,
	Banknote,
} from 'lucide-react';


interface HomePageProps {
	onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
	const [query, setQuery] = useState('');

	const categories = [
		{
			id: 'courses',
			title: 'Courses',
			description: 'Read and share course experiences',
			icon: BookOpen,
			color: 'from-emerald-500 to-teal-500',
		},
		{
			id: 'lecturers',
			title: 'Lecturers',
			description: 'Honest feedback from real students',
			icon: Users,
			color: 'from-blue-500 to-indigo-500',
		},
		{
			id: 'restaurants',
			title: 'Restaurants',
			description: 'Best bites on and off campus',
			icon: UtensilsCrossed,
			color: 'from-orange-500 to-amber-500',
		},
		{
			id: 'hostels',
			title: 'Hostels',
			description: 'Find the right place to live',
			icon: HomeIcon,
			color: 'from-purple-500 to-fuchsia-500',
		},
	];

	return (
		<main className="min-h-screen bg-background text-foreground">
			{/* Hero */}
			<section className="relative overflow-hidden">

				<div className="max-w-7xl mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-20">
					<div className="grid md:grid-cols-2 gap-10 items-center">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold mb-4">
								<Sparkles className="w-4 h-4 text-primary" />
								Built by and for Ashesi students
							</div>
							<h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
								Real insights. Smart choices.
							</h1>
							<p className="mt-4 text-lg md:text-xl text-muted-foreground">
								Discover the best courses, lecturers, restaurants, and hostels — powered by authentic student reviews.
							</p>

							<div className="mt-6 flex flex-col sm:flex-row gap-3">
								<div className="relative flex-1">
									<Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
									<input
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										placeholder="Search courses, lecturers, restaurants, hostels"
										className="w-full h-12 rounded-lg border border-border bg-input pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<button
									onClick={() => onNavigate('courses')}
									className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
								>
									Explore reviews
									<ArrowRight className="w-4 h-4" />
								</button>
							</div>

							<div className="mt-4 text-sm text-muted-foreground">
								Tagline: <span className="font-semibold text-foreground">Know more. Choose better.</span>
							</div>
						</div>

						<div className="hidden md:block">
							<Image
								src="/insider.jpeg"
								alt="Campus community illustration"
								width={560}
								height={420}
								priority
								className="w-full h-auto rounded-xl border border-border bg-card"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Get ahead section */}
			<section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
				<h2 className="text-3xl md:text-4xl font-black text-center">Get ahead with Ashesi Insider</h2>
				<p className="text-center text-muted-foreground mt-3 max-w-3xl mx-auto">
					We’re serving up trusted insights and anonymous conversation, so you’ll have the goods you need to succeed.
				</p>

				<div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
					<Feature icon={MessageSquare} label="Join your student community" />
					<Feature icon={ClipboardList} label="Find top-rated courses" />
					<Feature icon={Building2} label="Review lecturers & classes" />
					<Feature icon={Banknote} label="Compare hostel value" />
				</div>
			</section>

			{/* Start your search band */}
			<section className="bg-muted/40">
				<div className="max-w-7xl mx-auto px-4 py-12 md:py-16 text-center">
					<h3 className="text-2xl md:text-3xl font-black">Start your search</h3>
					<p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
						Need some inspiration? See what students are exploring on Ashesi Insider today.
					</p>
					<div className="mt-6 flex justify-center">
						<ChevronDown className="w-6 h-6 text-muted-foreground" />
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="max-w-7xl mx-auto px-4 pb-6 md:pb-10">
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{categories.map((c) => {
						const Icon = c.icon;
						return (
							<button
								key={c.id}
								onClick={() => onNavigate(c.id)}
								className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-transform hover:-translate-y-1"
							>
								<div className="relative">
									<div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground mb-4">
										<Icon className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold">{c.title}</h3>
									<p className="text-muted-foreground mt-1">{c.description}</p>
									<span className="inline-flex items-center gap-2 mt-4 text-primary font-semibold">
										Explore <ArrowRight className="w-4 h-4" />
									</span>
								</div>
							</button>
						);
					})}
				</div>
			</section>

			{/* Trust stats and CTA */}
			<section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
				<div className="grid md:grid-cols-5 gap-6">
					<div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 md:p-8">
						<h4 className="text-lg font-bold mb-4">Why students trust Ashesi Insider</h4>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<Stat value="240+" label="Courses Reviewed" />
							<Stat value="85+" label="Lecturers Rated" />
							<Stat value="35+" label="Restaurants Listed" />
							<Stat value="12+" label="Hostels Reviewed" />
						</div>
					</div>
					<div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between">
						<div>
							<h4 className="text-lg font-bold">Share your experience</h4>
							<p className="text-muted-foreground mt-1">
								Help other students make informed choices by leaving a quick review.
							</p>
						</div>
						<button
							onClick={() => onNavigate('courses')}
							className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-border font-semibold hover:bg-accent/50 transition-colors"
						>
							Write a review
							<ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="text-center rounded-xl border border-border bg-background p-4">
			<div className="text-3xl font-black text-primary mb-1">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

function Feature({
	icon: Icon,
	label,
}: {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
}) {
	return (
		<div className="flex flex-col items-center text-center">
			<div className="h-20 w-20 rounded-full border border-border flex items-center justify-center">
				<Icon className="w-8 h-8" />
			</div>
			<p className="mt-3 text-sm md:text-base">{label}</p>
		</div>
	);
}