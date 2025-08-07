import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer({ storeName, collections }: { storeName?: string; collections?: { id: string; name: string }[] } = {}) {
	const [editableDescription, setEditableDescription] = useState(
		'Your destination for premium fashion and apparel. Quality meets style in every piece we offer.'
	);
	const [editableSubscribeText, setEditableSubscribeText] = useState(
		'Subscribe to get updates on new arrivals and exclusive offers.'
	);
	const [socialLinks] = useState({
		facebook: 'https://facebook.com',
		instagram: 'https://instagram.com',
		twitter: 'https://twitter.com',
		youtube: 'https://youtube.com',
	});

	return (
		<footer className="bg-muted/30 border-t">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="space-y-4">
						<h3 className="text-xl font-semibold">{storeName || 'StyleHub'}</h3>
						<p
							contentEditable
							suppressContentEditableWarning
							onBlur={(e) => setEditableDescription(e.target.textContent || '')}
							className="text-muted-foreground text-sm max-w-sm"
						>
							{editableDescription}
						</p>
						<div className="flex space-x-4">
							<a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Facebook className="w-4 h-4" />
								</Button>
							</a>
							<a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Instagram className="w-4 h-4" />
								</Button>
							</a>
							<a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Twitter className="w-4 h-4" />
								</Button>
							</a>
							<a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<Youtube className="w-4 h-4" />
								</Button>
							</a>
						</div>
					</div>

					{/* Shop Links */}
					<div className="space-y-4">
						<h4 className="font-medium">Shop</h4>
						<div className="space-y-2 text-sm">
							{collections && collections.length > 0 ? (
								collections.map((col) => (
									<a
										key={col.id}
										href={`#${col.name}`}
										className="block text-muted-foreground hover:text-foreground transition-colors"
									>
										{col.name}
									</a>
								))
							) : (
								<span className="text-muted-foreground">No collections available</span>
							)}
						</div>
					</div>

					{/* Customer Service */}
					<div className="space-y-4">
						<h4 className="font-medium">Customer Service</h4>
						<div className="space-y-2 text-sm">
							<a
								href="#"
								className="block text-muted-foreground hover:text-foreground transition-colors"
							>
								Contact Us
							</a>
							<a
								href="#"
								className="block text-muted-foreground hover:text-foreground transition-colors"
							>
								Track Your Order
							</a>
						</div>
					</div>

					{/* Newsletter */}
					<div className="space-y-4">
						<h4 className="font-medium">Stay Updated</h4>
						<p
							contentEditable
							suppressContentEditableWarning
							onBlur={(e) => setEditableSubscribeText(e.target.textContent || '')}
							className="text-sm text-muted-foreground"
						>
							{editableSubscribeText}
						</p>
						<div className="flex space-x-2">
							<Input type="email" placeholder="Enter your email" className="flex-1" />
							<Button variant="black" size="sm">
								Subscribe
							</Button>{' '}
							{/* Updated to black variant */}
						</div>
					</div>
				</div>

				<Separator className="my-8" />

				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="text-sm text-muted-foreground">
						© 2024 {storeName || 'StyleHub'}. All rights reserved.
					</div>
					<div className="flex space-x-6 text-sm">
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Privacy Policy
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Terms of Service
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Cookie Policy
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}