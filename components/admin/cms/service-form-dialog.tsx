"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Service } from "@/types";
import { serviceSchema, type ServiceInput } from "@/lib/validations/cms";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberInput } from "@/components/forms/fields";
import { ImageInput, LinesInput } from "@/components/forms/cms-inputs";
import { slugify } from "@/lib/utils";

const EMPTY: ServiceInput = {
  name: "",
  slug: "",
  category: "",
  description: "",
  content: "",
  duration: 30,
  price: 0,
  image: "",
  benefits: [],
  whoNeedsIt: [],
  procedure: [],
  recovery: "",
  faqs: [],
  published: false,
  featured: false,
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  categories,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  service: Service | null;
  categories: string[];
  onSubmit: (values: ServiceInput) => Promise<unknown>;
}) {
  const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: EMPTY });
  const procedure = useFieldArray({ control: form.control, name: "procedure" });
  const faqs = useFieldArray({ control: form.control, name: "faqs" });
  const [tab, setTab] = React.useState("basics");
  const slugTouched = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    setTab("basics");
    slugTouched.current = Boolean(service);
    if (service) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = service;
      form.reset(rest);
    } else form.reset(EMPTY);
  }, [open, service, form]);

  async function submit(values: ServiceInput) {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      /* toast shown by caller */
    }
  }

  const errorTabs = Object.keys(form.formState.errors);
  const tabHasError = (fields: string[]) => fields.some((f) => errorTabs.includes(f));

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{service ? `Edit ${service.name}` : "New service"}</DialogTitle>
          <DialogDescription>Published services appear on the website and in online booking.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit, () => toast_first_error(setTab, form.formState.errors as Record<string, unknown>))} className="space-y-5" noValidate>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="basics" className={tabHasError(["name", "slug", "category", "description", "duration", "price", "image"]) ? "text-destructive" : ""}>
                  Basics
                </TabsTrigger>
                <TabsTrigger value="content" className={tabHasError(["content", "benefits", "whoNeedsIt", "recovery"]) ? "text-destructive" : ""}>
                  Content
                </TabsTrigger>
                <TabsTrigger value="procedure" className={tabHasError(["procedure", "faqs"]) ? "text-destructive" : ""}>
                  Procedure & FAQs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (!slugTouched.current) form.setValue("slug", slugify(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              slugTouched.current = true;
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormDescription>/services/{field.value || "…"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input list="service-categories" {...field} />
                        </FormControl>
                        <datalist id="service-categories">
                          {categories.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (min)</FormLabel>
                          <FormControl>
                            <NumberInput min={15} step={15} value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From price (₹)</FormLabel>
                          <FormControl>
                            <NumberInput min={0} value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short description</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <ImageInput value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Published</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Featured on home page</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overview (detailed content)</FormLabel>
                      <FormControl>
                        <Textarea rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits</FormLabel>
                        <LinesInput value={field.value} onChange={field.onChange} placeholder="One benefit per line" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whoNeedsIt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who needs it</FormLabel>
                        <LinesInput value={field.value} onChange={field.onChange} placeholder="One item per line" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="recovery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery & aftercare</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="procedure" className="space-y-6 pt-2">
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Treatment process</h3>
                    <Button type="button" size="sm" variant="ghost" onClick={() => procedure.append({ title: "", description: "" })}>
                      <Plus /> Add step
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {procedure.fields.length === 0 && <p className="text-sm text-muted-foreground">No steps yet.</p>}
                    {procedure.fields.map((f, i) => (
                      <div key={f.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[1fr_2fr_auto]">
                        <FormField
                          control={form.control}
                          name={`procedure.${i}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={`Step ${i + 1} title`} aria-label="Step title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`procedure.${i}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Description" aria-label="Step description" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => procedure.remove(i)} aria-label="Remove step">
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Service FAQs</h3>
                    <Button type="button" size="sm" variant="ghost" onClick={() => faqs.append({ question: "", answer: "" })}>
                      <Plus /> Add FAQ
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {faqs.fields.length === 0 && <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
                    {faqs.fields.map((f, i) => (
                      <div key={f.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`faqs.${i}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Question" aria-label="Question" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`faqs.${i}.answer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea rows={2} placeholder="Answer" aria-label="Answer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => faqs.remove(i)} aria-label="Remove FAQ">
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : service ? "Save changes" : "Create service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** Jump to the tab that holds the first validation error. */
function toast_first_error(setTab: (t: string) => void, errors: Record<string, unknown>) {
  const keys = Object.keys(errors);
  if (keys.some((k) => ["name", "slug", "category", "description", "duration", "price", "image"].includes(k))) setTab("basics");
  else if (keys.some((k) => ["content", "benefits", "whoNeedsIt", "recovery"].includes(k))) setTab("content");
  else setTab("procedure");
}
