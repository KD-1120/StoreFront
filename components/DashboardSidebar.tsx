import React from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { BarChart3, Package, ShoppingCart, Settings, Home, User } from 'lucide-react';

interface DashboardSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const sidebarItems = [
	{
		id: 'overview',
		label: 'Overview',
		icon: Home,
	},
	{
		id: 'builder',
		label: 'Store Builder',
		icon: BarChart3,
	},
	{
		id: 'products',
		label: 'Products',
		icon: Package,
	},
	{
		id: 'orders',
		label: 'Orders',
		icon: ShoppingCart,
	},
	{
		id: 'profile',
		label: 'Profile',
		icon: User,
	},
	{
		id: 'settings',
		label: 'Store Settings',
		icon: Settings,
	},
];

export function DashboardSidebar({
	currentView,
	onViewChange,
}: DashboardSidebarProps) {
	return (
		<>
		<aside className="w-64 border-r bg-muted/30 p-6 fixed h-screen">
			<nav className="space-y-2">
				{sidebarItems.map((item) => {
					const Icon = item.icon;
					return (
						<Button
							key={item.id}
							variant={currentView === item.id ? 'black' : 'ghost'} // Ensure active selections use black variant
							className={cn(
								'w-full justify-start',
								currentView === item.id &&
									'bg-black text-white' // Explicitly set black background and white text
							)}
							onClick={() => onViewChange(item.id)}
						>
							<Icon className="mr-3 h-4 w-4" />
							{item.label}
						</Button>
					);
				})}
			</nav>
		</aside>
		<div className="ml-64">
			{/* Main content area starts here */}
			{/* ...existing content layout for the dashboard... */}
		</div>
		</>
	);
}