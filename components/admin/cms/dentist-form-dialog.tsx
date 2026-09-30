"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Dentist } from "@/types";
import { dentistSchema, type DentistInput } from "@/lib/validations/cms";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberInput } from "@/components/forms/fields";
import { ImageInput } from "@/components/forms/cms-inputs";
import { WEEKDAYS } from "@/lib/constants";
import { slugify, toDateKey } from "@/lib/utils";

const defaultWeek = () =>
  [0, 1, 2, 3, 4, 5, 6].map((d) => ({ day: d, enabled: d !== 0, start: "10:00", end: "19:00", breakStart: "13:30", breakEnd: "14:30" }));

const EMPTY: DentistInput = {
  name: "",
  slug: "",
  photo: "",
  qualification: "",
  specialization: "",
  experienceYears: 0,
  bio: "",
  languages: ["English", "Hindi"],
  serviceIds: [],
  workingHours: defaultWeek(),
  leaves: [],
  active: true,
};

export function DentistFormDialog({
  open,
  onOpenChange,
  dentist,
  services,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  dentist: Dentist | null;
  services: { id: string; name: string; category: string }[];
  onSubmit: (values: DentistInput) => Promise<unknown>;
}) {
  const form = useForm<DentistInput>({ resolver: zodResolver(dentistSchema), defaultValues: EMPTY });
  const hours = useFieldArray({ control: form.control, name: "workingHours" });
  const leaves = useFieldArray({ control: form.control, name: "leaves" });
  const [tab, setTab] = React.useState("profile");
  const [languages, setLanguages] = React.useState("");
  const slugTouched = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    setTab("profile");
    slugTouched.current = Boolean(dentist);
    if (dentist) {
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = dentist;
      const week = defaultWeek().map((d) => rest.workingHours.find((w) => w.day === d.day) ?? { ...d, enabled: false });
      form.reset({ ...rest, workingHours: week.map((w) => ({ ...w, breakStart: w.breakStart ?? "", breakEnd: w.breakEnd ?? "" })) });
      setLanguages(rest.languages.join(", "));
    } else {
      form.reset(EMPTY);
      setLanguages(EMPTY.languages.join(", "));
    }
  }, [open, dentist, form]);

  async function submit(values: DentistInput) {
    const payload = {
      ...values,
      languages: languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      workingHours: values.workingHours.map((w) => ({ ...w, breakStart: w.breakStart || undefined, breakEnd: w.breakEnd || undefined })),
    };
    try {
      await onSubmit(payload as DentistInput);
      onOpenChange(false);
    } catch {
      /* toast handled by caller */
    }
  }

  const selected = form.watch("serviceIds");

  return (
    <Dialog open={open} onOpenChange={(o) => !form.formState.isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dentist ? `Edit ${dentist.name}` : "Add dentist"}</DialogTitle>
          <DialogDescription>Working hours and leave drive the online booking availability.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit, (errors) => {
              const keys = Object.keys(errors);
              setTab(keys.includes("workingHours") ? "schedule" : keys.includes("leaves") ? "leave" : keys.includes("serviceIds") ? "services" : "profile");
            })}
            className="space-y-5"
            noValidate
          >
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="services">Services ({selected.length})</TabsTrigger>
                <TabsTrigger value="schedule">Working hours</TabsTrigger>
                <TabsTrigger value="leave">Leave ({leaves.fields.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dr. Full Name"
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
                        <FormLabel>Profile URL slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              slugTouched.current = true;
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder="BDS, MDS (…)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (years)</FormLabel>
                        <FormControl>
                          <NumberInput min={0} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel htmlFor="dentist-languages">Languages</FormLabel>
                    <Input id="dentist-languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi" />
                  </FormItem>
                </div>
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo</FormLabel>
                      <ImageInput value={field.value} onChange={field.onChange} aspect="aspect-[5/6]" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active (visible on website & bookable)</FormLabel>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="services" className="pt-2">
                <FormField
                  control={form.control}
                  name="serviceIds"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {services.map((s) => {
                        const checked = field.value.includes(s.id);
                        return (
                          <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-accent/50">
                            <Checkbox checked={checked} onCheckedChange={(c) => field.onChange(c ? [...field.value, s.id] : field.value.filter((x) => x !== s.id))} />
                            <span>
                              <span className="font-medium">{s.name}</span>
                              <span className="block text-xs text-muted-foreground">{s.category}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </TabsContent>

              <TabsContent value="schedule" className="pt-2">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-canvas text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Day</th>
                        <th className="px-2 py-2 text-left font-medium">Start</th>
                        <th className="px-2 py-2 text-left font-medium">End</th>
                        <th className="px-2 py-2 text-left font-medium">Break from</th>
                        <th className="px-2 py-2 text-left font-medium">Break to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                        const i = hours.fields.findIndex((f) => f.day === day);
                        if (i < 0) return null;
                        const enabled = form.watch(`workingHours.${i}.enabled`);
                        return (
                          <tr key={day} className="border-t">
                            <td className="px-3 py-2">
                              <FormField
                                control={form.control}
                                name={`workingHours.${i}.enabled`}
                                render={({ field }) => (
                                  <label className="flex items-center gap-2 font-medium">
                                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label={`${WEEKDAYS[day]} working`} />
                                    {WEEKDAYS[day]}
                                  </label>
                                )}
                              />
                            </td>
                            {(["start", "end", "breakStart", "breakEnd"] as const).map((k) => (
                              <td key={k} className="px-2 py-2">
                                <FormField
                                  control={form.control}
                                  name={`workingHours.${i}.${k}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="time" step={900} disabled={!enabled} aria-label={`${WEEKDAYS[day]} ${k}`} {...field} value={field.value ?? ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="leave" className="space-y-3 pt-2">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => leaves.append({ id: Math.random().toString(36).slice(2, 8), from: toDateKey(new Date()), to: toDateKey(new Date()), reason: "" })}
                  >
                    <Plus /> Add leave
                  </Button>
                </div>
                {leaves.fields.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No leave scheduled.</p>}
                {leaves.fields.map((l, i) => (
                  <div key={l.id} className="grid gap-2 rounded-lg border bg-canvas p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
                    {(["from", "to"] as const).map((k) => (
                      <FormField
                        key={k}
                        control={form.control}
                        name={`leaves.${i}.${k}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">{k === "from" ? "From" : "To"}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormField
                      control={form.control}
                      name={`leaves.${i}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Reason</FormLabel>
                          <FormControl>
                            <Input placeholder="Conference, personal…" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" className="self-end" onClick={() => leaves.remove(i)} aria-label="Remove leave">
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                {form.formState.isSubmitting ? "Saving…" : dentist ? "Save changes" : "Add dentist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
