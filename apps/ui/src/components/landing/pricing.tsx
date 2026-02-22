import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
                    <p className="text-muted-foreground">Cocursor is evolving to be more than just an IDE. It supports an entire ecosystem of AI agents and collaboration tools helping teams innovate faster.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
                    <div className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-medium">Free</h2>
                                <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
                                <p className="text-muted-foreground text-sm">Per editor</p>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link href="/sign-up">Get Started</Link>
                            </Button>

                            <hr className="border-dashed opacity-20" />

                            <ul className="list-outside space-y-3 text-sm">
                                {['Basic AI Assistance', '3 Collaborative Projects', 'Community Support', 'Web-based Runtime'].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="dark:bg-white/5 rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="font-medium">Pro</h2>
                                    <span className="my-3 block text-2xl font-semibold">$19 / mo</span>
                                    <p className="text-muted-foreground text-sm">Per editor</p>
                                </div>

                                <Button
                                    asChild
                                    className="w-full bg-primary hover:bg-primary/90">
                                    <Link href="/sign-up">Get Started</Link>
                                </Button>
                            </div>

                            <div>
                                <div className="text-sm font-medium">Everything in free plus:</div>

                                <ul className="mt-4 list-outside space-y-3 text-sm">
                                    {[
                                        'Unlimited Projects',
                                        'Advanced AI Agents',
                                        'Priority Multi-region Support',
                                        'Private Repositories',
                                        'Custom Domain Hosting',
                                        'Advanced Security Logs',
                                        'Team Management Tools',
                                        'Early Access to Features'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3 text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
