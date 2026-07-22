import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Lead Profiling Form" },
      {
        name: "description",
        content:
          "Submit your AI consultation request and share your business needs for fast lead profiling.",
      },
      { property: "og:title", content: "AI Lead Profiling Form" },
      {
        property: "og:description",
        content:
          "A responsive AI sales lead profiling form for collecting qualified consultation requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeadForm,
});

const JOB_TITLES = [
  "Founder", "CEO", "CTO", "HR Manager", "Sales Manager",
  "Operations Manager", "Product Manager", "Marketing Manager", "Consultant", "Other",
];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const INDUSTRIES = [
  "SaaS", "Healthcare", "Education", "Finance", "Manufacturing",
  "Retail", "E-commerce", "IT Services", "Consulting", "Real Estate", "Other",
];
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India", "Germany",
  "France", "Netherlands", "Singapore", "United Arab Emirates", "Brazil", "Japan", "Other",
];
const CHALLENGES = [
  "Lead Generation", "Sales Automation", "Employee Training",
  "Organizational Development", "Customer Support", "HR Processes",
  "AI Integration", "Process Automation", "CRM Management", "Other",
];
const BUDGETS = ["Under $1,000", "$1,000–5,000", "$5,000–10,000", "$10,000+"];
const TIMELINES = ["ASAP", "Within 1 Month", "1–3 Months", "Just Exploring"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  company_name: z.string().trim().min(1, "Company name is required").max(120),
  email: z.string().trim().email("Enter a valid work email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  job_title: z.string().min(1, "Select your role"),
  company_size: z.string().min(1, "Select company size"),
  industry: z.string().min(1, "Select an industry"),
  country: z.string().min(1, "Select a country"),
  business_challenges: z.array(z.string()).min(1, "Pick at least one challenge"),
  query: z.string().trim().min(20, "Tell us a bit more (20+ chars)").max(2000),
  budget: z.string().min(1, "Select a budget"),
  timeline: z.string().min(1, "Select a timeline"),
});

type FormState = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Business", icon: Building2 },
  { id: 3, label: "Needs", icon: Target },
  { id: 4, label: "Scope", icon: Sparkles },
];


function LeadForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [values, setValues] = useState<FormState>({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    job_title: "",
    company_size: "",
    industry: "",
    country: "",
    business_challenges: [],
    query: "",
    budget: "",
    timeline: "",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const stepFields: (keyof FormState)[][] = [
    ["full_name", "company_name", "email", "phone", "job_title", "company_size"],
    ["industry", "country", "business_challenges"],
    ["query"],
    ["budget", "timeline"],
  ];

  const validateStep = (i: number) => {
    const fields = stepFields[i];
    const res = schema.safeParse(values);
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!res.success) {
      for (const issue of res.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (fields.includes(key) && !errs[key]) errs[key] = issue.message;
      }
    }
    if (Object.keys(errs).length) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return false;
    }
    return true;
  };


  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep(step)) return;
    const final = schema.safeParse(values);
    if (!final.success) return;

    setSubmitting(true);
    setSubmitError(null);

    const body = {
      name: values.full_name,
      email: values.email,
      company: values.company_name,
      phone: values.phone,
      budget: values.budget,
      message: values.query,
      page_history: [
        "Home",
        "Products / AI Agents",
        "Personalized Gen-AI Copilots",
        "Conversational Voice Agents",
        "Success Stories",
        "Contact Us",
      ],
    };

    try {
      const response = await fetch("/api/public/lead-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null) as { success?: boolean; error?: string } | null;

      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || `Submission failed (${response.status}). Please try again.`);
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(
    () => (submitted ? 100 : ((step + 1) / STEPS.length) * 100),
    [step, submitted],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, submitted]);

  return (
    <main className="min-h-screen w-full px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Lead Profiling
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            AI Consultation Request
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Tell us about your business and what you're looking for. Our AI will analyze your
            requirements and connect you with the right solution.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-10 animate-scale-in">
          {submitted ? (
            <SuccessScreen />
          ) : (
            <>
              <StepIndicator step={step} progress={progress} />

              <div key={step} className="mt-8 animate-fade-in">
                {step === 0 && <StepPersonal values={values} errors={errors} set={set} />}
                {step === 1 && <StepBusiness values={values} errors={errors} set={set} />}
                {step === 2 && <StepNeeds values={values} errors={errors} set={set} />}
                {step === 3 && <StepScope values={values} errors={errors} set={set} />}
              </div>

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={back}
                  disabled={step === 0 || submitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={next} className="btn-gradient gap-2 rounded-xl px-6">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="btn-gradient gap-2 rounded-xl px-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Get My AI Consultation
                      </>
                    )}
                  </Button>
                )}
              </div>

              {submitError && (
                <p className="mt-3 text-center text-sm text-destructive animate-fade-in">
                  {submitError}
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your information is encrypted and never shared with third parties.
        </p>
      </div>
    </main>
  );
}

function StepIndicator({ step, progress }: { step: number; progress: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border transition-all",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-white text-primary shadow-[0_0_0_4px_oklch(0.58_0.22_285/0.18)]",
                  !active && !done && "border-border bg-white text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={progress} className="mt-5 h-1.5" />
      <p className="mt-2 text-right text-xs text-muted-foreground">
        Step {step + 1} of {STEPS.length}
      </p>
    </div>
  );
}

type StepProps = {
  values: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
};

function Field({
  label, required, error, children, htmlFor,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive animate-fade-in">{error}</p>}
    </div>
  );
}

function SelectField({
  value, onChange, placeholder, options,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StepPersonal({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full Name" required error={errors.full_name} htmlFor="full_name">
        <Input id="full_name" placeholder="Priya Sharma" className="h-11 rounded-xl"
          value={values.full_name} onChange={(e) => set("full_name", e.target.value)} />
      </Field>
      <Field label="Company Name" required error={errors.company_name} htmlFor="company_name">
        <Input id="company_name" placeholder="Eubrics AI" className="h-11 rounded-xl"
          value={values.company_name} onChange={(e) => set("company_name", e.target.value)} />
      </Field>
      <Field label="Work Email" required error={errors.email} htmlFor="email">
        <Input id="email" type="email" placeholder="priya@eubrics.com" className="h-11 rounded-xl"
          value={values.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Phone Number" error={errors.phone} htmlFor="phone">
        <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-11 rounded-xl"
          value={values.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Job Title" required error={errors.job_title}>
        <SelectField value={values.job_title} onChange={(v) => set("job_title", v)}
          placeholder="Select your role" options={JOB_TITLES} />
      </Field>
      <Field label="Company Size" required error={errors.company_size}>
        <SelectField value={values.company_size} onChange={(v) => set("company_size", v)}
          placeholder="Employees" options={COMPANY_SIZES} />
      </Field>
    </div>
  );
}

function StepBusiness({ values, errors, set }: StepProps) {
  const toggleChallenge = (c: string) => {
    const has = values.business_challenges.includes(c);
    set("business_challenges", has
      ? values.business_challenges.filter((x) => x !== c)
      : [...values.business_challenges, c]);
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Industry" required error={errors.industry}>
          <SelectField value={values.industry} onChange={(v) => set("industry", v)}
            placeholder="Select industry" options={INDUSTRIES} />
        </Field>
        <Field label="Country" required error={errors.country}>
          <SelectField value={values.country} onChange={(v) => set("country", v)}
            placeholder="Select country" options={COUNTRIES} />
        </Field>
      </div>
      <Field label="Current Challenges" required error={errors.business_challenges}>
        <div className="grid gap-2 sm:grid-cols-2">
          {CHALLENGES.map((c) => {
            const checked = values.business_challenges.includes(c);
            return (
              <label
                key={c}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
                  checked
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-white hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleChallenge(c)} />
                <span>{c}</span>
              </label>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function StepNeeds({ values, errors, set }: StepProps) {
  return (
    <div className="space-y-5">
      <Field label="How can we help you?" required error={errors.query} htmlFor="query">
        <Textarea
          id="query"
          rows={7}
          className="rounded-xl text-sm leading-relaxed"
          placeholder={`e.g. "We want to deploy Eubrics conversational voice agents to upskill our sales team and get a Gen-AI copilot that boosts productivity across support and HR."`}
          value={values.query}
          onChange={(e) => set("query", e.target.value)}
        />
      </Field>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Be specific — our AI uses this to match the right specialist.</span>
        <span>{values.query.length}/2000</span>
      </div>
    </div>
  );
}

function StepScope({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Budget" required error={errors.budget}>
        <SelectField value={values.budget} onChange={(v) => set("budget", v)}
          placeholder="Select budget" options={BUDGETS} />
      </Field>
      <Field label="Timeline" required error={errors.timeline}>
        <SelectField value={values.timeline} onChange={(v) => set("timeline", v)}
          placeholder="When do you need this?" options={TIMELINES} />
      </Field>
      <div className="sm:col-span-2 rounded-xl border border-border bg-accent/30 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            Once submitted, our AI reviews your inputs and routes your request to the specialist
            best matched to your industry, budget, and timeline.
          </span>
        </p>
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="py-8 text-center animate-fade-in">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent">
        <CheckCircle2 className="h-9 w-9 text-primary" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-foreground">
        Thank you! Your request has been submitted.
      </h2>
    </div>
  );
}
