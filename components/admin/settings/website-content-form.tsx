"use client";

import * as React from "react";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSaveWebsiteContent } from "@/lib/query";
import type { WebsiteContent } from "@/types";
import { websiteContentSchema, type WebsiteContentInput } from "@/lib/validations/cms";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageInput, LinesInput } from "@/components/forms/cms-inputs";
import { FeatureIcon, ICON_KEYS } from "@/components/shared/icon";
import { SettingsSection, StickySaveBar } from "./section";

export function WebsiteContentForm({ content }: { content: WebsiteContent }) {
  const saveContent = useSaveWebsiteContent();
  const form = useForm<WebsiteContentInput>({ resolver: zodResolver(websiteContentSchema), defaultValues: content });
  const stats = useFieldArray({ control: form.control, name: "stats" });
  const why = useFieldArray({ control: form.control, name: "whyChooseUs" });
  const values = useFieldArray({ control: form.control, name: "about.values" });
  const milestones = useFieldArray({ control: form.control, name: "about.milestones" });

  React.useEffect(() => form.reset(content), [content, form]);

  async function onSubmit(v: WebsiteContentInput) {
    try {
      await saveContent.mutateAsync(v);
      form.reset(v);
    } catch {
      /* toast shown by the mutation */
    }
  }

  const field = (name: Parameters<typeof form.register>[0], label: string, multiline = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field: f }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>{multiline ? <Textarea rows={3} {...f} value={(f.value as string) ?? ""} /> : <Input {...f} value={(f.value as string) ?? ""} />}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const iconSelect = (name: `whyChooseUs.${number}.icon` | `about.values.${number}.icon`) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field: f }) => (
        <Select value={f.value} onValueChange={f.onChange}>
          <SelectTrigger className="w-[150px]" aria-label="Icon">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ICON_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                <FeatureIcon name={k} className="size-4" /> {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields."))} noValidate>
        <div className="mb-2 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              <ExternalLink /> Preview website
            </Link>
          </Button>
        </div>

        <SettingsSection title="Home hero" description="The first thing visitors see.">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("hero.eyebrow", "Eyebrow")}
            {field("hero.title", "Headline")}
            {field("hero.highlight", "Highlighted line")}
            <div className="grid grid-cols-2 gap-3">
              {field("hero.primaryCta", "Primary button")}
              {field("hero.secondaryCta", "Secondary button")}
            </div>
          </div>
          {field("hero.subtitle", "Sub-headline", true)}
          <FormField
            control={form.control}
            name="hero.image"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Hero image</FormLabel>
                <ImageInput value={f.value} onChange={f.onChange} aspect="aspect-[24/26]" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hero.trustPoints"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Trust points (one per line, max 4)</FormLabel>
                <LinesInput value={f.value} onChange={f.onChange} rows={3} />
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Trust stats" description="Shown under the hero and on the About page.">
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.fields.map((s, i) => (
              <div key={s.id} className="flex gap-2 rounded-lg border bg-canvas p-3">
                <FormField
                  control={form.control}
                  name={`stats.${i}.value`}
                  render={({ field: f }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input aria-label="Value" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stats.${i}.label`}
                  render={({ field: f }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input aria-label="Label" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => stats.remove(i)} aria-label="Remove stat">
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => stats.append({ value: "", label: "" })} disabled={stats.fields.length >= 4}>
            <Plus /> Add stat
          </Button>
        </SettingsSection>

        <SettingsSection title="Why choose us" description="Feature cards on the home page.">
          <div className="space-y-3">
            {why.fields.map((w, i) => (
              <div key={w.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[auto_1fr_2fr_auto]">
                {iconSelect(`whyChooseUs.${i}.icon`)}
                <FormField
                  control={form.control}
                  name={`whyChooseUs.${i}.title`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl>
                        <Input aria-label="Title" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`whyChooseUs.${i}.description`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl>
                        <Input aria-label="Description" {...f} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => why.remove(i)} aria-label="Remove card">
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => why.append({ icon: "sparkles", title: "", description: "" })} disabled={why.fields.length >= 9}>
            <Plus /> Add card
          </Button>
        </SettingsSection>

        <SettingsSection title="About page" description="Story, mission, values and milestones.">
          {field("about.title", "Page title")}
          {field("about.intro", "Intro", true)}
          {field("about.story", "Our story", true)}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("about.mission", "Mission", true)}
            {field("about.vision", "Vision", true)}
          </div>
          <FormField
            control={form.control}
            name="about.image"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>About image</FormLabel>
                <ImageInput value={f.value} onChange={f.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Values</p>
            <div className="space-y-2">
              {values.fields.map((v, i) => (
                <div key={v.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[auto_1fr_2fr_auto]">
                  {iconSelect(`about.values.${i}.icon`)}
                  <FormField control={form.control} name={`about.values.${i}.title`} render={({ field: f }) => <Input aria-label="Value title" {...f} />} />
                  <FormField control={form.control} name={`about.values.${i}.description`} render={({ field: f }) => <Input aria-label="Value description" {...f} />} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => values.remove(i)} aria-label="Remove value">
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => values.append({ icon: "sparkles", title: "", description: "" })} disabled={values.fields.length >= 6}>
              <Plus /> Add value
            </Button>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Milestones</p>
            <div className="space-y-2">
              {milestones.fields.map((m, i) => (
                <div key={m.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[90px_1fr_2fr_auto]">
                  <FormField control={form.control} name={`about.milestones.${i}.year`} render={({ field: f }) => <Input aria-label="Year" {...f} />} />
                  <FormField control={form.control} name={`about.milestones.${i}.title`} render={({ field: f }) => <Input aria-label="Milestone title" {...f} />} />
                  <FormField control={form.control} name={`about.milestones.${i}.description`} render={({ field: f }) => <Input aria-label="Milestone description" {...f} />} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => milestones.remove(i)} aria-label="Remove milestone">
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => milestones.append({ year: "", title: "", description: "" })} disabled={milestones.fields.length >= 8}>
              <Plus /> Add milestone
            </Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Call to action & contact" description="The booking banner and the contact page header.">
          {field("cta.title", "CTA title")}
          {field("cta.subtitle", "CTA subtitle", true)}
          {field("cta.button", "CTA button")}
          {field("contact.title", "Contact page title")}
          {field("contact.subtitle", "Contact page subtitle", true)}
        </SettingsSection>

        <StickySaveBar dirty={form.formState.isDirty} saving={form.formState.isSubmitting} onReset={() => form.reset(content)} />
      </form>
    </Form>
  );
}
