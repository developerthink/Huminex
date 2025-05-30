'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BookDemo = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch('https://formsubmit.co/developerthink.official@gmail.com', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                toast.success('Your demo request has been sent successfully.');
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            toast.error('Failed to send your request. Please try again.');
        } finally {
            setIsOpen(false);
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className='rounded-xl border border-muted/30'>
                    Book a Demo
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-[700px] overflow-hidden !border-none rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left side - Background and testimonial */}
                    <div className="bgGrad  p-8 text-white hidden md:block">
                        <div className="flex items-center mb-6">
                            <Calendar className="mr-2 h-6 w-6" />
                            <h3 className="text-xl font-semibold">Demo</h3>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Request a call with our expert</h2>

                        <p className="mt-6 opacity-90">
                        Our experts are ready to help you realize your vision with personalized solutions for events, product launches, and more.
                        </p>
                    </div>

                    {/* Right side - Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} action="https://formsubmit.co/developerthink.official@gmail.com" method="POST">
                            {/* FormSubmit.co specific fields */}
                            <input type="hidden" name="_subject" value="New Demo Request" />
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_captcha" value="false" />

                            <h3 className="text-xl font-semibold mb-4">Book a Demo</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your name
                                    </label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Enter your first name"
                                        required
                                        className="border-gray-300 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        className="border-gray-300 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Write your message
                                    </label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us a little about your project"
                                        className="resize-none h-32 border-gray-300 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-6 text-white py-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send message"}
                            </Button>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                By clicking on "Send message" button, you agree to our{" "}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookDemo;