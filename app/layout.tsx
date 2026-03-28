import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: theme initialization script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{
var f=localStorage.getItem('catppuccin-flavor')||'mocha';
var a=localStorage.getItem('catppuccin-accent')||'blue';
var r=document.documentElement;
var p='--catppuccin-'+f+'-';
r.style.setProperty('--background','var('+p+'base)');
r.style.setProperty('--foreground','var('+p+'text)');
r.style.setProperty('--card','var('+p+'surface0)');
r.style.setProperty('--card-foreground','var('+p+'text)');
r.style.setProperty('--popover','var('+p+'surface1)');
r.style.setProperty('--popover-foreground','var('+p+'text)');
r.style.setProperty('--primary','var('+p+a+')');
r.style.setProperty('--primary-foreground','var('+p+'base)');
r.style.setProperty('--secondary','var('+p+'surface1)');
r.style.setProperty('--secondary-foreground','var('+p+'text)');
r.style.setProperty('--muted','var('+p+'surface0)');
r.style.setProperty('--muted-foreground','var('+p+'subtext0)');
r.style.setProperty('--accent','var('+p+'surface2)');
r.style.setProperty('--accent-foreground','var('+p+'text)');
r.style.setProperty('--destructive','var('+p+'red)');
r.style.setProperty('--border','var('+p+'surface1)');
r.style.setProperty('--input','var('+p+'surface2)');
r.style.setProperty('--ring','var('+p+a+')');
r.style.setProperty('--sidebar','var('+p+'mantle)');
r.style.setProperty('--sidebar-foreground','var('+p+'text)');
r.style.setProperty('--sidebar-primary','var('+p+a+')');
r.style.setProperty('--sidebar-primary-foreground','var('+p+'base)');
r.style.setProperty('--sidebar-accent','var('+p+'surface0)');
r.style.setProperty('--sidebar-accent-foreground','var('+p+'text)');
r.style.setProperty('--sidebar-border','var('+p+'surface2)');
r.style.setProperty('--sidebar-ring','var('+p+'overlay1)');
}catch(e){}})();`,
					}}
				/>
			</head>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
