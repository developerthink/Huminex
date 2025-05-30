import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Brain,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Star,
  ArrowRight,
  MessageSquare,
  Target,
  Award,
  Mail,
  Phone,
  ChevronDown,
  Sparkles,
  Video,
  Play,
  CheckCircle,
  TrendingUp,
  Globe,
  Mic,
  Camera,
  Settings,
  Infinity,
  LucideFilePenLine,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BookDemo from "@/components/book-demo";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { SlEnvolopeLetter } from "react-icons/sl";
import { PiFileArrowUpDuotone } from "react-icons/pi";
import { MdOutlineAnalytics, MdOutlineVideoCameraFront } from "react-icons/md";

const steps = [
  {
    step: 1,
    title: "Create Job Posting",
    description: "Create a job posting with all the details",
    icon: <PiFileArrowUpDuotone />,
  },
  {
    step: 2,
    title: "Smart Application Process",
    description: "Smart application process with invitation and matching",
    icon: <SlEnvolopeLetter />,
  },
  {
    step: 3,
    title: "AI Interview Session",
    description: "AI Interview Session with video and audio",
    icon: <MdOutlineVideoCameraFront />,
  },
  {
    step: 4,
    title: "Analytics & Results",
    description: "Get detailed analytics and results",
    icon: <MdOutlineAnalytics />,
  },
];
export default async function HuminexLanding() {
  const session = await auth();
  if (session?.user?.role === "none") {
    redirect(`/role`);
  }
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 m-4 bg-slate-900/20 text-white backdrop-blur-2xl rounded-full">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-3xl px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Logo />
              <span className="text-2xl font-primary font-bold text-white">
                Huminex
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className=" transition-all duration-300 font-medium relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#how-it-works"
                className=" transition-all duration-300 font-medium relative group"
              >
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link
                href="/blog"
                className=" transition-all duration-300 font-medium relative group"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* <Link href="/login">
                <Button
                  variant="ghost"
                 className="rounded-xl !text-white"
                >
                  Log in
                </Button>
              </Link> */}
              <BookDemo />
              {session ? (
                <Link href={`/${session?.user?.role}/dashboard`}>
                  <Button className="rounded-xl border border-muted/30">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="rounded-xl border border-muted/30">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative heroGrad min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="grid gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="backdrop-blur-2xl p-2 text-lg border border-white/50 bg-white/10 text-white">
                  <Sparkles className="w-6 h-6 mr-2 animate-pulse-slow" />
                  <span className="text-white">
                    Over 100 interviews carried out
                  </span>
                </Badge>

                <h1 className="text-6xl lg:text-7xl text-white font-bold leading-tight">
                  Uniting Talent & Opportunity with AI
                </h1>

                <p className="text-xl text-white leading-relaxed max-w-xl">
                  A smart recruiting platform that finds top talent and helps
                  candidates shine with natural AI interviews, seamless resume
                  processing, and powerful analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`${
                    session?.user?.role
                      ? `/${session?.user?.role}/dashboard`
                      : "/register"
                  }`}
                >
                  <Button size="lg" className="p-5 h-12 border border-muted/30">
                    Get started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Button size="lg" variant="outline" className="p-5 h-12">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 glass rounded-full flex items-center justify-center border-border/30 cursor-pointer hover:bg-primary/10 transition-all duration-300 group">
              <ChevronDown className="w-6 h-6 text-primary animate-bounce group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-center">
            <div className="relative">
              <Card className="glass rounded-3xl border-primary/20 border !p-0 overflow-hidden  shadow-2xl">
                <CardContent className="p-0">
                  <div className="aspect-video bg-center bg-cover bg-[url('/videocalling.png')] flex items-center justify-center relative overflow-hidden"></div>
                </CardContent>
              </Card>

              {/* Floating Analytics Card */}
              <div className="absolute -right-8 -bottom-8 animate-float">
                <Card className="bgGrad text-primary-foreground rounded-3xl border-0 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm opacity-80">
                        Interview Quality
                      </div>
                      <div className="text-3xl font-primary font-bold">98%</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <Badge className=" rounded-full px-4 py-2 mb-6 border-primary/10 text-primary text-lg bg-primary/20">
                  <TrendingUp className="w-4 h-4 mr-2 " />
                  <span className="text-primary">Growing Community</span>
                </Badge>

                <h2 className="text-5xl font-primary font-bold mb-4">
                  Active interviews and assessments
                </h2>

                <div className="text-8xl font-primary font-bold text-primary mb-6 relative">
                  100+
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-2xl blur opacity-50 animate-pulse-slow"></div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">
                  The number of AI-powered interviews conducted monthly
                  continues to grow exponentially, making RecruitAI the leading
                  choice for intelligent hiring solutions.
                </p>
              </div>
              {/* Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass rounded-2xl border-primary/20 border bg-primary/10 p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-primary font-bold text-primary mb-2">
                    75%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Saved
                  </div>
                </Card>
                <Card className="glass rounded-2xl border-green-500/20 border bg-green-500/10 p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-primary font-bold text-chart-2 mb-2">
                    60%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost Reduction
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center bg-primary/10 border-primary/20 border p-6 rounded-2xl space-y-6 mb-20">
            <Badge className="glass rounded-full px-6 py-3 border-primary/20">
              <Sparkles className="w-4 h-4 mr-2 " />
              <span className="text-lg">Powerful Features</span>
            </Badge>
            <h2 className="text-5xl font-primary font-bold text-foreground">
              Everything you need for{" "}
              <span className="text-gradient">smart hiring</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets intuitive design to create the
              perfect interview experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Conversations",
                description:
                  "Natural, adaptive interviews that feel genuinely human while maintaining consistency.",
                color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Deep insights into candidate performance with comprehensive evaluation metrics.",
                color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
              },
              {
                icon: Users,
                title: "Smart Matching",
                description:
                  "Intelligent candidate-job matching based on skills, experience, and cultural fit.",
                color: "bg-green-500/10 text-green-500 border-green-500/20",
              },
              {
                icon: LucideFilePenLine,
                title: "Smart Resume Processing",
                description:
                  "AI instantly extracts and organizes resume data for quick profile creation.",
                color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
              },
              {
                icon: Shield,
                title: "Bias-Free Evaluation",
                description:
                  "Consistent, fair assessment standards that eliminate unconscious bias.",
                color: "bg-red-500/10 text-red-500 border-red-500/20",
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                description:
                  "Real-time performance insights and recommendations for both parties.",
                color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`glass border border-muted/50 shadow-xl transition-all duration-500 rounded-3xl group hover:scale-105 hover:shadow-lg relative overflow-hidden`}
              >
                <CardContent className="p-8 space-y-4 relative z-10">
                  <div
                    className={`w-16 h-16 border-2 glass rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${feature.color} p-3 rounded-full`}
                  >
                    <feature.icon className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-semibold ">{feature.title}</h3>
                  <p className="leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative">
        <div className="relative max-w-7xl mx-auto rounded-xl *:!text-white p-6 bg-primary">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl font-bold">
              How it <span className="text-gradient">works</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto">
              Simple, streamlined process from profile to hire in just a few
              steps.
            </p>
          </div>

          <div className="space-y-8 text-center">
            <Stepper defaultValue={10}>
              {steps.map(({ step, title, description, icon }) => (
                <StepperItem
                  key={step}
                  step={step}
                  className="relative flex-1 flex-col!"
                >
                  <StepperTrigger className="flex-col gap-3 rounded">
                    <StepperIndicator asChild>
                      <span className="text-primary z-10 *:w-14 *:h-14 bg-white rounded-full p-4 ring">
                        {icon}
                      </span>
                    </StepperIndicator>
                    <div className="space-y-0.5 px-2">
                      <StepperTitle className="text-xl">{title}</StepperTitle>
                      <StepperDescription className="max-sm:hidden text-white/80">
                        {description}
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  {step < steps.length && (
                    <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl font-primary font-bold text-foreground">
              Loved by <span className="text-gradient">thousands</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience with
              Huminex.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "HR Director at TechFlow",
                content:
                  "Huminex transformed our hiring process completely. We've reduced time-to-hire by 70% while improving candidate quality.",
                avatar: "SC",
                rating: 5,
              },
              {
                name: "Mike Rodriguez",
                role: "Startup Founder",
                content:
                  "As a growing startup, Huminex gave us enterprise-level hiring capabilities without the enterprise budget.",
                avatar: "MR",
                rating: 5,
              },
              {
                name: "Jennifer Park",
                role: "Software Engineer",
                content:
                  "The interview experience was unlike anything I've encountered. It felt conversational yet professional.",
                avatar: "JP",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="glass  bg-white border border-primary/20 shadow-xl  rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl group"
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" relative overflow-hidden">
        <div className="relative z-10 w-full px-6 text-center">
          <div className="space-y-8 bg-primary p-6 rounded-xl">
            <br />
            <h2 className="text-5xl font-bold text-white">
              Ready to revolutionize your hiring?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of forward-thinking companies and talented
              professionals experiencing the future of recruitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${
                  session?.user?.role
                    ? `/${session?.user?.role}/dashboard`
                    : "/register"
                }`}
              >
                <Button
                  size="lg"
                  className="!bg-white h-12 rounded-full p-4 px-10 text-black"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <p className="text-white/60 text-sm">
              No credit card required • Setup in 5 minutes
            </p>
          </div>
        </div>
      </section>
      <br />
      {/* Footer */}
      <footer className="py-10 relative bgGrad text-white  grid place-items-center">
        <Logo className="w-16" />
        <div className="relative max-w-7xl mt-5 mx-auto px-6">
          <p>
            © 2025 Huminex. All rights reserved. Build by{" "}
            <Link
              href="https://devyanshyadav.com"
              target="_blank"
              className="hover:underline"
            >
              Devyansh
            </Link>{" "}
            and{" "}
            <Link
              href="https://aasuyadav.com"
              target="_blank"
              className="hover:underline"
            >
              Aasu
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
